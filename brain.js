class Brain {
    constructor(input, hidden, output) {
        // Create sequential tf model (multi-layer perceptron)
        this.model = tf.sequential();

        let layers = [];

        if (input instanceof Brain) {
            // Use layer config from input brain
            for (let i = 0; i < input.model.layers.length; i++) {
                layers.push(tf.layers.dense(input.model.layers[i].getConfig()));
            }
        } else {
            // Create hidden layer with specified input and hidden nodes
            // Using sigmoid activation 0 -> 1
            layers.push(
                tf.layers.dense({
                    inputShape: [input],
                    units: hidden[0],
                    activation: "relu",
                })
            );

            for (let i = 1; i < hidden.length - 1; i++) {
                layers.push(
                    tf.layers.dense({
                        units: i,
                        activation: "relu",
                    })
                );
            }

            // Create output layer with specified number of nodes
            // Using softmax activation to make outputs sum 1 (probability)
            layers.push(
                tf.layers.dense({
                    units: output,
                    activation: "softmax",
                })
            );
        }

        // Add created layers to model
        for (let layer of layers) {
            this.model.add(layer);
        }

        // Compile sequential model with sgd optimizer and mean squared error loss function
        this.model.compile({
            optimizer: tf.train.sgd(0.1),
            loss: tf.losses.meanSquaredError,
        });

        if (input instanceof Brain) {
            this.model.setWeights(input.model.getWeights());
        }
    }

    getMovement(inputs) {
        // Dispose tensors created to stop memory leak
        return tf.tidy(() => {
            // Convert input array to tensor
            // Has to be 2d, as can feed in many sets of data simultaneously
            let tf_xs = tf.tensor2d(inputs);

            // Output is array of length = output nodes
            // Get this data synchronously - halts execution until done
            const output = this.model.predict(tf_xs).dataSync();

            // Return array of movement probabilities
            return output;
        });
    }

    copy() {
        return tf.tidy(() => {
            const newBrain = new Brain(this);
            const weights = this.model.getWeights();
            let weightsCopy = [];

            for (let i = 0; i < weights.length; i++) {
                weightsCopy.push(weights[i].clone());
            }

            newBrain.model.setWeights(weightsCopy);

            return newBrain;
        });
    }

    breed(b) {
        return tf.tidy(() => {
            let childBrain = new Brain(this);

            let parentAWeights = this.model.getWeights();
            let parentBWeights = b.model.getWeights();
            let childWeights = [];

            for (let i = 0; i < parentAWeights.length; i++) {
                let parentAValues = parentAWeights[i].dataSync().slice();
                let parentBValues = parentBWeights[i].dataSync().slice();
                let childValues = [];

                for (let j = 0; j < parentBValues.length; j++) {
                    let whichParent = floor(random(2)) + 1;

                    if (whichParent == 1) {
                        childValues.push(parentAValues[j]);
                    } else {
                        childValues.push(parentBValues[j]);
                    }
                }

                childWeights.push(tf.tensor(childValues, parentAWeights[i].shape));
            }

            childBrain.model.setWeights(childWeights);

            return childBrain;
        });
    }

    mutate(rate) {
        tf.tidy(() => {
            // Get weights from model
            const weights = this.model.getWeights();
            // Create array to store new weights
            let mutatedWeights = [];

            // Loop through weights array
            for (let i = 0; i < weights.length; i++) {
                // Get weight tensor from weights array
                let weight = weights[i];
                // Get shape of weight tensor
                let shape = weight.shape;
                // Get values from weight tensor
                let values = weight.dataSync().slice();

                // For each value in weight tensor
                for (let j = 0; j < values.length; j++) {
                    // If mutate rate is < random 0,1
                    if (rate < random()) {
                        // Adjust by random between -2 and 2
                        values[j] = values[j] + randomGaussian();
                    }
                }

                // Create new tensor based on mutated values
                let newWeightTensor = tf.tensor(values, shape);
                // Add new weight tensor to mutated weights
                mutatedWeights.push(newWeightTensor);
            }

            // Update model weights with mutated ones
            this.model.setWeights(mutatedWeights);
        });
    }

    dispose() {
        // Dispose optimizer tensor
        this.model.optimizer.dispose();
        // Dispose layer tensors
        this.model.dispose();
    }
}
