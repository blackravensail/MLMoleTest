# MLMoleTest

[MLMoleTest](https://mlmoletest.com) is a static web page with a client side implementation of a Convolutional Neural Network capable of classifying images of skin moles into benign and malignant. The speed of running the model is wholly dependent on you hardware. Ram errors may occur on iPhone due to the overhead of cropper.js and the size of the raw images.  

## How it works

MLMoleTest uses a model generated from preforming transfer learning on Inception_v3. Inception was created and trained by Google for the Imagenet classification competition. By retraining the last few layers on data gathered from the ISIC data-set. While this data-set is rather limited in scope, an attempt was made to gather more data from the Johns Hopkins Dermatology department, HIPPA regulations made it prohibitively difficult. With the ISIC data the models accuracy is about 80%. 

## A Note on Accuracy
80% is not high enough to take for granted. If you are worried about a mole, you should see a doctor for it. This was created primarily to demonstrate the efficacy of transfer leaning with small data-sets and the implementation of complex neural networks in JavaScript.
