"""
<Creation of a dataset of patches from large ostraca images>
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


import os
import gc
import cv2
from matplotlib import pyplot as plt
import tensorflow as tf
import numpy as np
from scipy.ndimage import zoom

### TF Records utility functions
def _int64_feature(value):
    return tf.train.Feature(int64_list=tf.train.Int64List(value=[value]))

def _bytes_feature(value):
    return tf.train.Feature(bytes_list=tf.train.BytesList(value=[value]))
    
def cropImg(img,align):
	size = 800
	y = (0.299*img[:,:,2] + 0.587*img[:,:,1] + 0.114*img[:,:,0]).reshape(size,2*size,1) #luminance

	img = np.concatenate((img,y),axis=2)
	# create diagonal fracture 
	mask = np.zeros(img.shape, np.uint8)
	mi = np.random.randint(750,800)
	ma = np.random.randint(800,850)
	pts = np.array([[0,0],[mi,0],[ma,size],[0,size]])
	_=cv2.drawContours(mask, np.int32([pts]),0, (255,255,255,255), -1)
	
	# apply mask
	img1 = img.copy()
	img2 = img.copy()

	img1[mask==0] = 0
	img2[mask>0] = 0
		
	# create and add transparency channel (0 = background, 1 = object)
	m1 = np.equal(img1[:,:ma,:], img[:,:ma,:]).astype(np.uint8)
	m2 = np.equal(img2[:,mi:,:], img[:,mi:,:]).astype(np.uint8)
	
	img1 = np.concatenate((img1[:,:ma,:],m1[:,:,:1]),axis=2)
	img2 = np.concatenate((img2[:,mi:,:],m2[:,:,:1]),axis=2)
	
	return img1[:,img1.shape[1]-size:,:],img2[:,:size,:] # return patches centered on the fracture line

#train_filename = 'pairs_ostraca2.tfrecords'	

train_filename = 'pairs_ostraca2.tfrecords'				
writer = tf.python_io.TFRecordWriter(train_filename)

pms = []
c=0
h=0
b=0
g=0
d=0
size = 800
for it,filename in enumerate(os.listdir(".")):
	if (".png" in filename):
		image = cv2.imread("./"+filename)
		print(it+1)
		print(filename)
		# create zero-padded image with both dimensions divisible by "size"
		new = np.zeros((image.shape[0]+image.shape[0]%size,image.shape[1]+image.shape[1]%size,3),dtype=np.float32) 
		new[:image.shape[0],:image.shape[1],:] = image
		image = new
		del new
		gc.collect()
		
		for i in range(0,image.shape[0],size):
			for j in range(0,image.shape[1],size):
			#extract patch 1, add luminance and transparency channel, and resize by 25 percent
				try:
					pm = image[i:i+size,j:j+size,:]/255.
					
					assert pm.shape == (size,size,3)
					y = (0.299*pm[:,:,2] + 0.587*pm[:,:,1] + 0.114*pm[:,:,0]).reshape(size,size,1)
					pm_ = np.concatenate((pm,y),axis=2)
					pm_ = np.concatenate((pm_,np.ones((size,size,1))),axis=2)
					pm_ = zoom(pm_,(0.25,0.25,1))
					pms.append(pm_)
				except Exception as e:
					#print(repr(e))
					#print("shape ",pm.shape)
					print("E1")
					continue
			#extract patch 2, concatenate with patch 1 in the given direction (ph = up, pb = down, pd = right, pg = left), and use cropImg() function to create the artificial fracture and to add luminance and transparency channel, , and resize by 25 percent
			# then write the pair in the TFRecord file
				try:
					ph = image[i-size:i,j:j+size,:]/255.
					assert ph.shape == (size,size,3)
					rec = np.concatenate((ph,pm),axis=0)
					rec = np.transpose(rec,(1,0,2))
					ph, pm2 = cropImg(rec,3)
					del rec
					pm2 = zoom(np.transpose(pm2,(1,0,2)),(0.25,0.25,1))
					ph = zoom(np.transpose(ph,(1,0,2)),(0.25,0.25,1))
					c += 1
					feature = {
						   'train/p1': _bytes_feature(tf.compat.as_bytes(pm2.tostring())),
						   'train/p2': _bytes_feature(tf.compat.as_bytes(ph.tostring())),
						   'train/label': _int64_feature(3)}

					example = tf.train.Example(features=tf.train.Features(feature=feature))
					writer.write(example.SerializeToString())
					pms.append(pm2)
					h += 1
				except Exception as e:
					#print(repr(e))
					#print("shape ",ph.shape)
					print("E2")
					pass
				try:
					pb = image[i+size:i+2*size,j:j+size,:]/255.
					assert pb.shape == (size,size,3)
					rec = np.concatenate((pm,pb),axis=0)
					rec = np.transpose(rec,(1,0,2))
					pm3, pb = cropImg(rec,4)
					del rec
					pm3 = zoom(np.transpose(pm3,(1,0,2)),(0.25,0.25,1))
					pb = zoom(np.transpose(pb,(1,0,2)),(0.25,0.25,1))
					c += 1
					feature = {
						   'train/p1': _bytes_feature(tf.compat.as_bytes(pm3.tostring())),
						   'train/p2': _bytes_feature(tf.compat.as_bytes(pb.tostring())),
						   'train/label': _int64_feature(4)}

					example = tf.train.Example(features=tf.train.Features(feature=feature))
					writer.write(example.SerializeToString())
					pms.append(pm3)
					b += 1
				except Exception as e:
					#print(repr(e))
					#print("shape ",pb.shape)
					print("E3")
					pass
				try:
					pg = image[i:i+size,j-size:j,:]/255.
					assert pg.shape == (size,size,3)
					rec = np.concatenate((pg,pm),axis=1)
					pg, pm4 = cropImg(rec,2)
					pg = zoom(pg,(0.25,0.25,1))
					pm4 = zoom(pm4,(0.25,0.25,1))
					del rec
					c += 1
					feature = {
						   'train/p1': _bytes_feature(tf.compat.as_bytes(pm4.tostring())),
						   'train/p2': _bytes_feature(tf.compat.as_bytes(pg.tostring())),
						   'train/label': _int64_feature(2)}

					example = tf.train.Example(features=tf.train.Features(feature=feature))
					writer.write(example.SerializeToString())
					pms.append(pm4)
					g += 1
				except Exception as e:
					#print(repr(e))
					#print("shape ",pg.shape)
					print("E4")
					pass
				try:
					pd = image[i:i+size,j+size:j+2*size,:]/255.
					assert pd.shape == (size,size,3)
					rec = np.concatenate((pm,pd),axis=1)
					pm5, pd = cropImg(rec,1)
					pm5 = zoom(pm5,(0.25,0.25,1))
					pd = zoom(pd,(0.25,0.25,1))
					del rec
					#pairs.append((pm5,pd,1))
					c += 1
					feature = {
						   'train/p1': _bytes_feature(tf.compat.as_bytes(pm5.tostring())),
						   'train/p2': _bytes_feature(tf.compat.as_bytes(pd.tostring())),
						   'train/label': _int64_feature(1)}

					example = tf.train.Example(features=tf.train.Features(feature=feature))
					writer.write(example.SerializeToString())
					pms.append(pm5)
					d += 1
				except Exception as e:
					#print(repr(e))
					#print("shape ",pd.shape)
					print("E5")
					pass
		del image
		gc.collect()
		
print(len(pms))
print(h)
print(b)
print(g)
print(d)
n=0

# select random non-matching pairs of patches from the list of patches in the image, and add them to the TFRecords file

for i in range((len(pms)-5)//3):
	if i < ((len(pms)-5)//3):
		c += 1
		pms[i] = pms[i].astype(np.float32)
		pms[i+5] = pms[i+5].astype(np.float32)
		feature = {
			   'train/p1': _bytes_feature(tf.compat.as_bytes(pms[i].tostring())),
			   'train/p2': _bytes_feature(tf.compat.as_bytes(pms[i+5].tostring())),
			   'train/label': _int64_feature(0)}
	
		example = tf.train.Example(features=tf.train.Features(feature=feature))
		n += 1
		# Serialize to string and write on the file
		writer.write(example.SerializeToString())
	
writer.close()
print(n)
print(c)
print("tfrecord file complete")