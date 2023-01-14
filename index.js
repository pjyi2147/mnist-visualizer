let mnist;

let train_index = 0;
let train_index_track = 0;
let epoch = 1;

let test_index = 0;

let nn;
let train_image;

let user_digit;
let userinputs = [];

function train(show) {
    let inputs = [];
    if (show) {
        train_image.loadPixels();
    }
    for (let i = 0; i < 28 * 28; i++) {
        let bright = Math.ceil(mnist.train_images[train_index][i] / 255);
        inputs[i] = bright;
        if (show) {
            let index = i * 4;
            train_image.pixels[index + 0] = bright * 255;
            train_image.pixels[index + 1] = bright * 255;
            train_image.pixels[index + 2] = bright * 255;
            train_image.pixels[index + 3] = 255;
        }
    }
    if (show) {
        train_image.updatePixels();
        image(train_image, 600, 0, 200, 200);
    }

    let label = mnist.train_labels[train_index];
    let targets = new Array(10).fill(0);
    targets[label] = 1;

    let prediction = nn.predict(inputs);
    let guess = findMax(prediction);

    document.querySelector('#label').innerHTML = label;
    document.querySelector('#guess').innerHTML = guess;
    if (guess == label) {
        select('#guess').class('correct');
    } else {
        select('#guess').class('wrong');
    }

    nn.train(inputs, targets);

    // console.log(train_index);
    train_index = (train_index + 1) % mnist.train_labels.length;
    train_index_track++;
}

function testing() {
    let start_index = Math.floor(Math.random() * 10000);
    let test_index = start_index;

    let total_tests = 0;
    let total_correct = 0;
    for (let i = 0; i < 100; i++) {
        test_index = (test_index) % mnist.test_labels.length;
        let inputs = [];
        for (let i = 0; i < 28 * 28; i++) {
            inputs[i] = Math.ceil(mnist.test_images[test_index][i] / 255);
        }

        let label = mnist.test_labels[test_index];
        let targets = new Array(10).fill(0);
        targets[label] = 1;

        let prediction = nn.predict(inputs);
        let guess = findMax(prediction);

        total_tests++;
        if (guess == label) {
            total_correct++;
        }
        test_index++;
    }
    let percent = 100 * (total_correct / total_tests);
    select('#percent').html(nf(percent, 2, 2) + '%');

    recordTestResults(percent);
}

function recordTestResults(percent)
{
    let testresult = document.createElement("p");
    let test_text = document.createTextNode("Test at index: " + train_index_track + " result: " + nf(percent, 2, 2) + '%');
    testresult.appendChild(test_text);
    document.getElementById("test_results").appendChild(testresult);
    if (train_index == 0)
    {
        let epoch_element = document.createElement("p");
        let epoch_text = document.createTextNode("--- epoch " + epoch + " ---");
        epoch_element.appendChild(epoch_text);
        document.getElementById("test_results").appendChild(epoch_element);
        epoch++;
    }
}

function guessUserDigit() {
    let img = user_digit.get();
    img.resize(28, 28);
    img.loadPixels();
    for (let i = 0; i < 28 * 28; i++) {
        userinputs[i] = img.pixels[i * 4] / 255;
    }
    let userprediction = nn.predict(userinputs);
    let userguess = findMax(userprediction);
    select('#user_guess').html(userguess);
    select('#user_guess_p').html(nf(userprediction[userguess] * 100, 2, 2) + '%');
    return img;
}

function keyPressed() {
    if (keyCode == ESCAPE) {
        user_digit.background(0);
    }
}

function findMax(arr) {
    return arr.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
}

function draw() {
    background(0);
    image(user_digit, 0, 0);
    let userimg = guessUserDigit();
    image(userimg, 300, 0, 200, 200);
    if (mnist) {
        for (let i = 0; i < 20; i++) {
            if (i == 0) {
                train(true);
            } else {
                train(false);
            }
        }
        if (train_index % 1000 == 0) {
            testing();
            updateLearningRate();
        }
    }

    if (mouseIsPressed) {
        user_digit.stroke(255);
        user_digit.strokeWeight(20);
        user_digit.line(mouseX, mouseY, pmouseX, pmouseY);
    }
}

function updateLearningRate()
{
    document.getElementById("learning_rate").innerHTML = "Current learning rate: " + nf(nn.learning_rate, 1, 6);
}

function setup() {
    createCanvas(800, 200).parent('container');
    nn = new NeuralNetwork(28 * 28, 100, 10);
    user_digit = createGraphics(200, 200);
    user_digit.pixelDensity(1);
    train_image = createImage(28, 28);

    document.getElementById("hidden_layer").innerHTML = "Hidden layer: " + nn.hidden_nodes;

    loadMNIST(function (data) {
        mnist = data;
        console.log(mnist);
    });
}
