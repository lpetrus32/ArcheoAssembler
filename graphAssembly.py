"""
<Graph-based pipeline to create global assembly proposals>
    Copyright (C) <2019>  <Cecilia Ostertag>
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
"""


import tensorflow as tf
import numpy as np
from matplotlib import pyplot as plt
from keras.layers import Conv2D, BatchNormalization, MaxPooling2D, LeakyReLU, Cropping2D, Input, Concatenate, Lambda, Flatten, Dense, Dropout
from keras import Sequential, Model
from keras import backend as K
import os
import keras
import gc
import cv2
from keras.utils.training_utils import multi_gpu_model
import random
import scipy

os.environ["CUDA_VISIBLE_DEVICES"]="1" #select available gpus on the cluster

def missingNeighbors(G,node,idx):
	# return the list of missing neighbors (in the up, down, left, and right direction) for a patch
	# in the graph, each patch is represented as a node, and each alignment direction is represented by an oriented edge
	
	ref = ["H","B","G","D"]
	edges = nx.edges(G,node)
	pos = []
	# get the list of neighbours that already exist
	for edge in edges:
		pos.append(G[edge[0]][edge[1]]["pos"])
	# get the image from the node attribute
	img = np.frombuffer(G.node[node]["img"]).reshape(400,400,5)
	# add the neighbours we don't want to search because it is the border of the reconstructeed image
	# if the pixels one one side of the image are black in the red channel and do not correpond to transparent pixels (fracture) in the transparency channel, then it is the border of the reconstructed image  
	# TODO need to check the > 200 test, should be > 1
	if np.all(img[:,img.shape[1]-1,0] < 0.15) and np.all(img[:,img.shape[1]-1,4] > 200):
		pos.append("D")
	if np.all(img[:,0,0] < 0.15) and np.all(img[:,0,4] > 200):
		pos.append("G")
	if np.all(img[img.shape[0]-1,:,0] < 0.15) and np.all(img[img.shape[0]-1,:,4] > 200):
		pos.append("B")
	if np.all(img[0,:,0] < 0.15) and np.all(img[0,:,4] > 200):
		pos.append("H")
	# return the remaining neighbours to find
	return set(ref) - set(pos)
	
def isGoodCandidate(model,inputs,cl,maxval):
	# use NN model to predict the alignment direction between two patches p1 and p2
	# if the predicted alignement is the same than the direction that is being tested (cl), and if the associated probability is superior to the threshold (maxval), then p2 is a good candidate to be the neighbouring patch in the given direction 
	p1 = inputs[0]
	p2 = inputs[1]
		
	pred = np.squeeze(model.predict_on_batch(inputs))
	pred2 = np.sort(np.squeeze(pred))
	print("TRUE ",cl)
	p = np.where(pred == pred2[-1])[0] # predicted alignment direction (class with the highest probability)
	print("PROBA ",pred2[-1])
	if (p == cl and pred2[-1] > maxval):
		return True, pred2[-1], 1
	return False, 0, 0
	
def isGoodAlignment(model,inputs,cl,maxval):
	# use a second NN model to predict the quality of the proposed alignement between two patches p1 and p2
	if cl == 1:
		rec = np.concatenate((inputs[0],inputs[1]),axis=2)
	elif cl == 2:
		rec = np.concatenate((inputs[1],inputs[0]),axis=2)
	elif cl == 3:
		rec = np.concatenate((inputs[1],inputs[0]),axis=1)
		rec = np.transpose(rec,(0,2,1,3))
	elif cl == 4:
		rec = np.concatenate((inputs[0],inputs[1]),axis=1)
		rec = np.transpose(rec,(0,2,1,3))
	
	pred = model.predict_on_batch(rec)
	
	pr = np.amax(pred,axis=1)
	p = np.argmax(pred, axis=1)
	if p == 1 and pr > maxval:
		return True, pr
	return False, 0
	
def findNeighborsOnGrid(G,node):
	# use the position of a patch in the reconstructed image to find if there are neighbours that need to be connected to the node representation of this patch
	nodePosition = node["position"]
	neighbors = {}
	toRemove = []
	for n in G:
		try :
			position = G.node[n]["position"]
			if (position[0] == nodePosition[0]+1) and (position[1] == nodePosition[1]):
				neighbors[n] = 1
			if (position[0] == nodePosition[0]-1) and (position[1] == nodePosition[1]):
				neighbors[n] = 2
			if (position[0] == nodePosition[0]) and (position[1] == nodePosition[1]+1):
				neighbors[n] = 3
			if (position[0] == nodePosition[0]) and (position[1] == nodePosition[1]-1):
				neighbors[n] = 4
		except KeyError:
			print("positionerror")
			toRemove.append(n)
	for n in toRemove:
		G.remove_node(n)
	return neighbors
		
### Load NN models
		
net = keras.models.load_model('patchAssemble_ost2.h5',custom_objects={"tf": tf}) # model to predict alignment direction
assemb_net = keras.models.load_model('Assemblies.h5',custom_objects={"tf": tf}) # model to evaluate the quality of alignements

### Load a test set

patchFile = np.load("recon_ost5.npz") # list of patches extracted from one large ostraca image
patchList0 = patchFile['arr_0']
patchList0 = np.random.permutation(patchList0)
print(len(patchList0))

### Initialize directed graph

import networkx as nx
A = nx.DiGraph()
size = 400

### Delete empty patches, and create an id for each patch
ids = {}
i = 0
patchList=[]
for patch in patchList0:
	s = 0
	m = 0
	for a in np.ndarray.flatten(patch[:,:,0]):
		if a < 0.05: # black pixel
			s += 1
			if s > m:
				m = s
		else:
			s = 0
	if m > ((size*size)-30000): # too many contiguous black pixels
		print(m)
		continue
	else:
		patchList.append(patch)
		ids[patch.tobytes()] = i
		i += 1
patchList2 = np.asarray(patchList)	
k = 0

print(patchList2.shape)

nbMinCC = patchList2.shape[0] # min number of connected components (1 connected component per patch = not assembled at all)


listGraphs = [(A,patchList2)]
it = 0
while it < len(listGraphs):
	G = listGraphs[it][0]
	patchList = listGraphs[0][1]
	incr = 10

	#iterate over the list of patches
	while len(patchList) > 0:
		print("PATCH 1")
		patch1 = patchList[0]
		print(np.mean(patch1))
		print("id1 ",ids[patch1.tobytes()])
		print("REMAINING ",len(patchList))
	
		added1 = False # keep track if the current querry patch will be added to the graph at this iteration, this allows to make a distinction between following from a patch previously added to the reconstructed image, and using a new lone patch
		if not G.has_node(ids[patch1.tobytes()]): 
			#print("nb nodes ",nx.number_of_nodes(G))
			if nx.number_of_nodes(G) == 0:
				# the reconstructed image is empty, so this patch will be the origin of our reconstruction
				G.add_node(ids[patch1.tobytes()],txt="ORIGIN",itr=nx.number_of_nodes(G),img=patch1.tobytes())
				G.node[ids[patch1.tobytes()]]["position"]=(0,0)
				# compute the remaining neighbours to find for the query patch
				mP1 = missingNeighbors(G,ids[patch1.tobytes()],1)
				added1 = True
			else:
				# the reconstructed image is not empty, so by default this patch will be temporarily considered as a new origin point
				G.add_node(ids[patch1.tobytes()],txt="origin",itr=nx.number_of_nodes(G),img=patch1.tobytes())
				G.node[ids[patch1.tobytes()]]["position"]=(incr,0)
				# compute the remaining neighbours to find for the query patch
				mP1 = missingNeighbors(G,ids[patch1.tobytes()],1)
				added1 = True
				incr += 5
		else:
			#the patch is already placed somewhere in the reconstructed image, so we compute the remaining neighbours to find for the query patch
			mP1 = missingNeighbors(G,ids[patch1.tobytes()],1)
	
		probabilities = {1:[0],2:[0],3:[0],4:[0]}
		maxVals = {1:0.6,2:0.6,3:0.6,4:0.6} # probability threshold for each alignment direction
		maxPatches = {1:(),2:(),3:(),4:()}
		indexes = {1:0.8,2:0.8,3:0.8,4:0.8}
		corresp = {1:"G",2:"D",3:"B",4:"H"} # correspondance between class and alignement direction from the point of view of the candidate patch
		corresp2 = {1:"D",2:"G",3:"H",4:"B"} # correspondance between class and alignement direction from the point of view of the query patch
		

		patchList = patchList[1:]
		patchList2 = np.copy(patchList)
	
		i = 0
		found = 0
		
		# iterate over the remaining patches
		for patch2 in patchList2:
			found2 = 0
			if patch2.tobytes() == patch1.tobytes():
				# should not be possible
				continue
			added = False # keep track if the current candidate patch will be added to the graph at this iteration
			if not G.has_node(ids[patch2.tobytes()]): # temporarily add the new patch to the graph
				G.add_node(ids[patch2.tobytes()],img=patch2.tobytes())
				added = True
				print("adding node")
			else:
				continue
			
			# compute the remaining neighbours to find for the candidate patch
			mP2 = missingNeighbors(G,ids[patch2.tobytes()],2)

			# find the matching alignements between the query and the candidate patch
			alignments = []
			if "G" in mP1 and "D" in mP2:
				alignments.append(2)
			if "D" in mP1 and "G" in mP2:
				alignments.append(1)
			if "H" in mP1 and "B" in mP2:
				alignments.append(3)
			if "B" in mP1 and "H" in mP2:
				alignments.append(4)
			
			if alignments == []:
				#if there is no possible match, the candidate patch is removed from the graph
				print("no alignments")
				if added == True:
					G.remove_node(ids[patch2.tobytes()])
					added = False
				continue
	
			# reshape patches for NN model
			p1 = patch1.reshape(1,size,size,5)
			p2 = patch2.reshape(1,size,size,5)
			
			# use NN model to test each possible alignement direction
			for align in alignments:
				if not G.has_node(ids[patch2.tobytes()]):
					# should not be possible
					G.add_node(ids[patch2.tobytes()],img=patch2.tobytes())
					added = True
					
				test1, proba1, rank = isGoodCandidate(net,[p1,p2],align,0.7)
				#testalign1, probaalign1 = isGoodAlignment(assemb_net,[p1, p2],align,0.8)
				if test1 == True:# and testalign1 == True:
					probabilities[align][0] = proba1
					# if the candidate patch is a good candidate, its coordinates (position) are temporarly updated to reflect its position in the reconstructed image
					if align == 1:
						G.node[ids[patch2.tobytes()]]["position"] = (G.node[ids[patch1.tobytes()]]["position"][0]+1,G.node[ids[patch1.tobytes()]]["position"][1])
					if align == 2:
						G.node[ids[patch2.tobytes()]]["position"] = (G.node[ids[patch1.tobytes()]]["position"][0]-1,G.node[ids[patch1.tobytes()]]["position"][1])
					if align == 3:
						G.node[ids[patch2.tobytes()]]["position"] = (G.node[ids[patch1.tobytes()]]["position"][0],G.node[ids[patch1.tobytes()]]["position"][1]+1)
					if align == 4:
						G.node[ids[patch2.tobytes()]]["position"] = (G.node[ids[patch1.tobytes()]]["position"][0],G.node[ids[patch1.tobytes()]]["position"][1]-1)
					
					# look around in the reconstructed image if some neighbours need to be considered immediately
					neighs = findNeighborsOnGrid(G,G.node[ids[patch2.tobytes()]])
					
					# for each neighbour, need to test if the candidate patch has also a correct alignement probability with it
					for neigh in neighs.keys():
						if neigh == ids[patch1.tobytes()]:
							continue
						pNeigh = np.frombuffer(G.node[neigh]["img"]).reshape(1,size,size,5)
						test2, proba2, _ = isGoodCandidate(net,[p2,pNeigh],neighs[neigh],0.6)
						#testalign2, probaalign2 = isGoodAlignment(assemb_net,[p2, pNeigh],neighs[neigh],0.8)
						if test2 == True:# and testalign2 == True:
							probabilities[align].append(proba2)
					
					# compute the mean of alignment probabilities in the neighborhood of the candidate patch, based on where it could be placed in the reconstructed image
					moy = np.mean(probabilities[align])
					
					if moy > maxVals[align]:
						maxVals[align] = moy
						maxPatches[align]=(patch2.tobytes(),neighs)
						found = 1
						found2 = 1
						# if the candidate patch satisfies the requirements, it is moved to the start of patchList, to be the query patch for the next iteration
						patchList = np.delete(patchList,i,axis=0)
						patchList = np.append(p2,patchList,axis=0)
						
						# duplicate current graph
						newG = G.copy()
						
						# for each alignment direction, if a good candidate was found, it is added to the new graph, with its corresponding position in the reconstructed image, and with two oriented edges between itself and each neighbour
						
						if align == 1 and maxPatches[align] != ():
							newG.add_node(ids[maxPatches[align][0]],txt=str(rank)+"_"+str(moy),itr=nx.number_of_nodes(G),img = maxPatches[align][0], position = (newG.node[ids[patch1.tobytes()]]["position"][0]+1,newG.node[ids[patch1.tobytes()]]["position"][1]))
							newG.add_edge(ids[patch1.tobytes()],ids[maxPatches[align][0]],pos="D")
							newG.add_edge(ids[maxPatches[align][0]],ids[patch1.tobytes()],pos="G")
							for neigh in maxPatches[align][1]:
								if neigh == ids[patch1.tobytes()]:
										continue
								newG.add_edge(ids[maxPatches[align][0]],neigh,pos=corresp2[maxPatches[align][1][neigh]])
								newG.add_edge(neigh,ids[maxPatches[align][0]],pos=corresp[maxPatches[align][1][neigh]])
			
				
						if align == 2 and maxPatches[align] != ():
							newG.add_node(ids[maxPatches[align][0]],txt=str(rank)+"_"+str(moy),itr=nx.number_of_nodes(G),img = maxPatches[align][0], position = (newG.node[ids[patch1.tobytes()]]["position"][0]-1,newG.node[ids[patch1.tobytes()]]["position"][1]))
							newG.add_edge(ids[patch1.tobytes()],ids[maxPatches[align][0]],pos="G")
							newG.add_edge(ids[maxPatches[align][0]],ids[patch1.tobytes()],pos="D")

							for neigh in maxPatches[align][1]:
								if neigh == ids[patch1.tobytes()]:
										continue
								newG.add_edge(ids[maxPatches[align][0]],neigh,pos=corresp2[maxPatches[align][1][neigh]])
								newG.add_edge(neigh,ids[maxPatches[align][0]],pos=corresp[maxPatches[align][1][neigh]])


						if align == 3 and maxPatches[align] != ():
							newG.add_node(ids[maxPatches[align][0]],txt=str(rank)+"_"+str(moy),itr=nx.number_of_nodes(G),img = maxPatches[align][0], position = (newG.node[ids[patch1.tobytes()]]["position"][0],newG.node[ids[patch1.tobytes()]]["position"][1]+1))
							newG.add_edge(ids[patch1.tobytes()],ids[maxPatches[align][0]],pos="H")
							newG.add_edge(ids[maxPatches[align][0]],ids[patch1.tobytes()],pos="B")
							for neigh in maxPatches[align][1].keys():
								val = maxPatches[align][1][neigh]
								if neigh == ids[patch1.tobytes()]:
										continue
								newG.add_edge(ids[maxPatches[align][0]],neigh,pos=corresp2[val])
								newG.add_edge(neigh,ids[maxPatches[align][0]],pos=corresp[val])


						if align == 4 and maxPatches[align] != ():
							newG.add_node(ids[maxPatches[align][0]],txt=str(rank)+"_"+str(moy),itr=nx.number_of_nodes(G),img = maxPatches[align][0], position = (newG.node[ids[patch1.tobytes()]]["position"][0],newG.node[ids[patch1.tobytes()]]["position"][1]-1))
							newG.add_edge(ids[patch1.tobytes()],ids[maxPatches[align][0]],pos="B")
							newG.add_edge(ids[maxPatches[align][0]],ids[patch1.tobytes()],pos="H")

							for neigh in maxPatches[align][1]:
								if neigh == ids[patch1.tobytes()]:
										continue
								newG.add_edge(ids[maxPatches[align][0]],neigh,pos=corresp2[maxPatches[align][1][neigh]])
								newG.add_edge(neigh,ids[maxPatches[align][0]],pos=corresp[maxPatches[align][1][neigh]])
								
								
						listGraphs.append((newG,patchList))
						print("NB OF POSSIBLE GRAPHS ",len(listGraphs))
		
			i += 1
			# if the candidate patch did not meet the requirements because of its other neighbours, it is removed from the graph
			if found2 == 0:
				if added == True:
					G.remove_node(ids[patch2.tobytes()])
					added = False
		
		# for each alignment direction, the best candidate is added to the current graph, with its corresponding position in the reconstructed image, and with two oriented edges between itself and each neighbour	
		for maxPatch in maxPatches.keys():
			if maxPatch == 1 and maxPatches[maxPatch] != ():
				print("maxpatch ",ids[maxPatches[maxPatch][0]])
				print("maxprobs ",maxVals[maxPatch])
				G.add_node(ids[maxPatches[maxPatch][0]],txt=str(maxVals[maxPatch]),itr=nx.number_of_nodes(G),img = maxPatches[maxPatch][0], position = (G.node[ids[patch1.tobytes()]]["position"][0]+1,G.node[ids[patch1.tobytes()]]["position"][1]))
				G.add_edge(ids[patch1.tobytes()],ids[maxPatches[maxPatch][0]],pos="D")
				G.add_edge(ids[maxPatches[maxPatch][0]],ids[patch1.tobytes()],pos="G")
				for neigh in maxPatches[maxPatch][1]:
					if neigh == ids[patch1.tobytes()]:
							continue
					G.add_edge(ids[maxPatches[maxPatch][0]],neigh,pos=corresp2[maxPatches[maxPatch][1][neigh]])
					G.add_edge(neigh,ids[maxPatches[maxPatch][0]],pos=corresp[maxPatches[maxPatch][1][neigh]])
			
				
			if maxPatch == 2 and maxPatches[maxPatch] != ():
				print("maxpatch ",ids[maxPatches[maxPatch][0]])
				print("maxprobs ",maxVals[maxPatch])
				G.add_node(ids[maxPatches[maxPatch][0]],txt=str(maxVals[maxPatch]),itr=nx.number_of_nodes(G),img = maxPatches[maxPatch][0], position = (G.node[ids[patch1.tobytes()]]["position"][0]-1,G.node[ids[patch1.tobytes()]]["position"][1]))
				G.add_edge(ids[patch1.tobytes()],ids[maxPatches[maxPatch][0]],pos="G")
				G.add_edge(ids[maxPatches[maxPatch][0]],ids[patch1.tobytes()],pos="D")

				for neigh in maxPatches[maxPatch][1]:
					if neigh == ids[patch1.tobytes()]:
							continue
					G.add_edge(ids[maxPatches[maxPatch][0]],neigh,pos=corresp2[maxPatches[maxPatch][1][neigh]])
					G.add_edge(neigh,ids[maxPatches[maxPatch][0]],pos=corresp[maxPatches[maxPatch][1][neigh]])


			if maxPatch == 3 and maxPatches[maxPatch] != ():
				print("maxpatch ",ids[maxPatches[maxPatch][0]])
				print("maxprobs ",maxVals[maxPatch])
				G.add_node(ids[maxPatches[maxPatch][0]],txt=str(maxVals[maxPatch]),itr=nx.number_of_nodes(G),img = maxPatches[maxPatch][0], position = (G.node[ids[patch1.tobytes()]]["position"][0],G.node[ids[patch1.tobytes()]]["position"][1]+1))
				G.add_edge(ids[patch1.tobytes()],ids[maxPatches[maxPatch][0]],pos="H")
				G.add_edge(ids[maxPatches[maxPatch][0]],ids[patch1.tobytes()],pos="B")
				for neigh in maxPatches[maxPatch][1].keys():
					val = maxPatches[maxPatch][1][neigh]
					if neigh == ids[patch1.tobytes()]:
							continue
					G.add_edge(ids[maxPatches[maxPatch][0]],neigh,pos=corresp2[val])
					G.add_edge(neigh,ids[maxPatches[maxPatch][0]],pos=corresp[val])


			if maxPatch == 4 and maxPatches[maxPatch] != ():
				print("maxpatch ",ids[maxPatches[maxPatch][0]])
				print("maxprobs ",maxVals[maxPatch])
				G.add_node(ids[maxPatches[maxPatch][0]],txt=str(maxVals[maxPatch]),itr=nx.number_of_nodes(G),img = maxPatches[maxPatch][0], position = (G.node[ids[patch1.tobytes()]]["position"][0],G.node[ids[patch1.tobytes()]]["position"][1]-1))
				G.add_edge(ids[patch1.tobytes()],ids[maxPatches[maxPatch][0]],pos="B")
				G.add_edge(ids[maxPatches[maxPatch][0]],ids[patch1.tobytes()],pos="H")

				for neigh in maxPatches[maxPatch][1]:
					if neigh == ids[patch1.tobytes()]:
							continue
					G.add_edge(ids[maxPatches[maxPatch][0]],neigh,pos=corresp2[maxPatches[maxPatch][1][neigh]])
					G.add_edge(neigh,ids[maxPatches[maxPatch][0]],pos=corresp[maxPatches[maxPatch][1][neigh]])		
		
		# if no candidates were found, the next query patch will form a new connected component in the graph
		if found == 0:
			toAdd = patch1
			try:
				if added1 == True:
						added1 = False
			except IndexError:
				break
			print("not found !!")
			print("NODES ",G.nodes())
			
			
		else:
			
			if k % 1 == 0:
				# filter nodes who don't have coordinates (that should not be possible, so probably a bug or mistake somewhere)		
				pos = {}
				toRemove = []
				for n in G:
					try:
						pos[n] = G.node[n]['position']
					except KeyError:
						print("pos error")
						toRemove.append(n)
				for n in toRemove:
					G.remove_node(n)
			
				# Draw reconstructed image using the corrdinates of patches

				fig=plt.figure(figsize=(10,10))
				ax=plt.subplot()
				ax.set_aspect('auto')
				#nx.draw_networkx(G,pos)
				nx.draw_networkx_nodes(G,pos)
				#nx.draw_networkx_labels(G,pos)
				nx.draw_networkx_edges(G,pos,ax=ax, arrowstyle='->', arrowsize=5, nodesize=10)
				edge_labels = dict([((u,v,),d['pos']) for u,v,d in G.edges(data=True)])
				nx.draw_networkx_edge_labels(G,pos,edge_labels=edge_labels, label_pos=0.3)
		
				trans=ax.transData.transform
				trans2=fig.transFigure.inverted().transform

				piesize=0.1 # this is the image size
				p2=piesize/2.0
				for n in G:
					xx,yy=trans(pos[n]) # figure coordinates
					xa,ya=trans2((xx,yy)) # axes coordinates
					a = plt.axes([xa-p2,ya-p2, piesize, piesize])
					a.set_aspect('equal')
					try:
						img=np.frombuffer(G.node[n]['img'])
						img=img.reshape(size,size,5)
						a.imshow(img[:,:,0],cmap="gray")
						a.axis('off')
					except KeyError:
						print("img error")
						continue
		
				print("NODES2 ",G.nodes())
				#plt.show()
			
			pass
	
		k += 1

	#plt.show()
	nbCC1 = nx.number_weakly_connected_components(G)
	nbCC2 = nx.number_strongly_connected_components(G)
	nbCC = max(nbCC1, nbCC2)
	print("CC ",nbCC)
	plt.show()
	
	# if the number of connected components is small, save the result image as a reconstruction proposition
	if nbCC <= 5:
		#nbMinCC = nbCC

		minx = 1000
		miny = 1000
		maxx = -1000
		maxy = -1000
		pos = {}
		for n in G:
			try:
				pos[n] = G.node[n]['position']
				print(G.node[n]['position'])
				if minx > pos[n][1]:
					minx = pos[n][1]
				if miny > pos[n][0]:
					miny = pos[n][0]
				if maxx < pos[n][1]:
					maxx = pos[n][1]
				if maxy < pos[n][0]:
					maxy = pos[n][0]
			except KeyError:
				print("position error")
				print(n)
	


		mx = (maxx - minx) * size
		my = (maxy - miny) * size
		new = np.zeros((mx+size,my+size,3))

		for n in G:
			try:
				img=np.frombuffer(G.node[n]['img'])
				txt = G.node[n]['txt'][:6]
				img=img.reshape(size,size,5)
				img = img[:,:,:3]
				img = img.copy()
				font = cv2.FONT_HERSHEY_SIMPLEX
				#cv2.putText(img,itr,(150,150), font, 4,(0,255,0),3,cv2.LINE_AA)
				#cv2.putText(img,txt,(50,50), font, 2,(0,0,255),2,cv2.LINE_AA)
				cv2.rectangle(img,(0,0),(400,400),(0,255,0),2)

				px = (G.node[n]['position'][1] - minx) * size
				py = (G.node[n]['position'][0] - miny) * size

				new[px:px+size,py:py+size,:]=np.flip(img,0)
			except KeyError:
				print("key error")
				img=np.frombuffer(G.node[n]['img'])
				img=img.reshape(size,size,5)
				img = img[:,:,:3]
				img = img.copy()

				px = (G.node[n]['position'][1] - minx) * size
				py = (G.node[n]['position'][0] - miny) * size

				new[px:px+size,py:py+size,:]=np.flip(img,0)
				continue	

		print("NODES ",G.nodes())	
		cv2.imwrite("./preprocessed_/test/recon_ost_CC"+str(nbCC)+"_it"+str(it)+".png",np.flip(new,0)*255.)
	
	it += 1