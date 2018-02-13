const $ = require("jquery");
import cropper from "cropper";
import _ from 'lodash';
import "materialize-loader";
import * as KerasJS from 'keras-js';

import './style.css';
import sample from "./images/a2.jpg";
import ndarray from 'ndarray';
import ops from 'ndarray-ops';
import model1 from "./graphs/78.71.bin"


$(document).ready(function() {
    makeCropper()
    var ctx = document.getElementById('canvas').getContext("2d");
    ctx.drawImage(document.getElementById("samp"),10, 10)


    runModel();
})

function makeCropper() {
    var canvas = $("#canvas"),
        context = canvas.get(0).getContext("2d"),
        $result = $('#result');

    // jQuery
    $('#fileInput').on('change', function() {
        if (this.files && this.files[0]) {
            if (this.files[0].type.match(/^image\//)) {
                console.log(this.files[0]);
                console.log(this.files[0].type.match(/^image\//));
                var reader = new FileReader();
                reader.onload = function(evt) {
                    var img = new Image();
                    img.onload = function() {
                        context.canvas.height = img.height;
                        context.canvas.width = img.width;
                        context.drawImage(img, 0, 0);
                        var cropper = canvas.cropper({
                            aspectRatio: 1 / 1
                        });
                        $('#btnCrop').click(function() {
                            // Get a string base 64 data url
                            var croppedImageDataURL = canvas.cropper('getCroppedCanvas').toDataURL("image/png");
                            $result.append($('<img>').attr('src', croppedImageDataURL));
                        });
                        $('#btnRestore').click(function() {
                            canvas.cropper('reset');
                            $result.empty();
                        });
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            } else {
                alert("Invalid file type! Please select an image file.");
            }
        } else {
            alert('No file(s) selected.');
        }
    });
}

function runModel() {
    console.log('Running Model');

    const model = new KerasJS.Model({
        filepath: model1,
        gpu: true
    })
    console.log("HI")

    const ctx = document.getElementById('canvas').getContext('2d');
    const imageData = ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );

    const { data, width, height } = imageData;

    // data processing
    // see https://github.com/fchollet/keras/blob/master/keras/applications/imagenet_utils.py
    // and https://github.com/fchollet/keras/blob/master/keras/applications/inception_v3.py
    let dataTensor = ndarray(new Float32Array(data), [ width, height, 4 ]);
    let dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [
      width,
      height,
      3
    ]);
    ops.divseq(dataTensor, 255);
    ops.subseq(dataTensor, 0.5);
    ops.mulseq(dataTensor, 2);
    ops.assign(
      dataProcessedTensor.pick(null, null, 0),
      dataTensor.pick(null, null, 0)
    );
    ops.assign(
      dataProcessedTensor.pick(null, null, 1),
      dataTensor.pick(null, null, 1)
    );
    ops.assign(
      dataProcessedTensor.pick(null, null, 2),
      dataTensor.pick(null, null, 2)
    );
    const inputData = { ["input_1"] : dataProcessedTensor.data };
    model
      .ready()
      .then(() => {
        console.log("here");
        return model.predict(inputData);
      })
      .then(outputData => {
        console.log(outputData);
      })
      .catch(err => {
        // handle error
      })

  }
