import tensorflow
import numpy
from pathlib import Path
import cv2
from PIL import Image
import os
import sys
import matplotlib.pyplot as plt

def Model():
    if not os.path.isdir("handwrite_recog.model"):
        mnist = tensorflow.keras.datasets.mnist
        (pixel_train, classfication_train), (pixel_test, classfication_test) = mnist.load_data()
        pixel_train = tensorflow.keras.utils.normalize(pixel_train,axis=1) #60000 * (28x28)
        pixel_test = tensorflow.keras.utils.normalize(pixel_test,axis=1)

        model = tensorflow.keras.models.Sequential()
        model.add(tensorflow.keras.layers.Flatten(input_shape = (28,28)))
        model.add(tensorflow.keras.layers.Dense(256, activation='relu'))
        model.add(tensorflow.keras.layers.Dense(256, activation='relu'))
        model.add(tensorflow.keras.layers.Dense(10, activation='softmax')) #Output layer

        model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

        model.fit(pixel_train,classfication_train, epochs=3)

        model.save('handwrite_recog.model')

    else:
        model = tensorflow.keras.models.load_model('handwrite_recog.model')
    return model


def main():
    model = Model()
    imgName = sys.argv[1]
    img = cv2.imread(imgName)[:,:,0]
    img = cv2.resize(img, (28, 28))
    img = numpy.invert(numpy.array([img]))

    if (numpy.sum(img) == 0):
        print ("ERROR: Empty Image")
    else:
        prediction = model.predict(img)
        print(f"The digit is probably a {numpy.argmax(prediction)}")

        #plt.imshow(img[0], cmap=plt.cm.binary)
        #plt.show()

if __name__ == "__main__":
    main()
