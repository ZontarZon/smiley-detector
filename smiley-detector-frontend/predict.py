import os
import keras
import tensorflow as tf

if __name__ == '__main__':
    imgPath = input()
    #imgPath = os.path.join(imgPath)
    #model = keras.models.load_model('./models/model_1.keras')
    model = keras.models.load_model('./models/model_2.keras')
    # Read in target file (an image)
    img = tf.io.read_file(imgPath)

    # Decode the read file into a tensor & ensure 3 colour channels 
    img = tf.image.decode_image(img, channels=3)
    img = tf.expand_dims(img, axis=0) # add an extra dimension at axis 0
    pred = model.predict(img)
    print(pred)
