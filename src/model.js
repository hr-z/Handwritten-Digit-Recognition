// Import TensorFlow.js
import * as tf from '@tensorflow/tfjs';
// Define the model
export async function createModel() {
    var mnist = require("mnist");
    var set = mnist.set(8000,2000);
    var trainingData = set.training;
    //var testSet = set.test;
    //const trainingData = mnist.training(0, 60000);
    // const testingData = mnist.testing(0, 10000);


    const inputFields = trainingData.map((sample) => sample.input);
    const outputFields = trainingData.map((sample) => sample.output);
    const pixel_train = tf.tensor(inputFields); 
    const classfication_train = tf.tensor(outputFields);
    for (let i = 0 ; i < 8000; i++) {
      pixel_train[i].reshape([28,28]);
      classfication_train[i].reshape([28,28]);
    }
    console.log(trainingData.length);
        // const pixel_test = tf.tensor(testingData.images.values);
        // const classfication_test = tf.tensor(testingData.labels.values);

  const model = tf.sequential();
  model.add(tf.layers.flatten({ inputShape: [784] })); // [28,28]
  model.add(tf.layers.dense({ units: 256, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 256, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
  model.compile({
    optimizer: 'adam',
    loss: 'sparseCategoricalCrossentropy',
    metrics: ['accuracy'],
  });
  await model.fit(pixel_train, classfication_train, {epochs: 3});
  return model;
};
