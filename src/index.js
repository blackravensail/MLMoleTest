const $ = require("jquery");
import cropper from "cropper";
//import _ from 'lodash';
import "materialize-loader";
import * as KerasJS from 'keras-js';

import './style.css';
import './cropper.min.css';
import sample from "./images/a2.jpg";
import gear from './images/gearcogs.png';
import ndarray from 'ndarray';
import ops from 'ndarray-ops';
import model1 from "./graphs/78.71.bin"


var i = 0;
var model;
window.rr = model;

$(document).ready(function() {

    $("#loadModel").on('click', function() {
        model = new KerasJS.Model({
            filepath: model1,
            gpu: true
        });
        window.rr = model;
        $('.modelData').html("<span style='color: green; font-weight: bold; font-size:2.5rem;'>Model Loaded</span>")
        $('#upBtn').toggleClass('disabled');
    });


    $("input#fileID").change(function() {
        if (this.files && this.files[0]) {
            if (this.files[0].type.match(/^image\//)) {
                $('figure').html("<canvas id='canvas' height='299' width='299'></canvas><figcaption><div class='btn colapse-btn' id='runPredict'>Run</div></figcaption>");
                var canvas  = $("#canvas");
                var context = canvas.get(0).getContext("2d");
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
                        $('#runPredict').click(function() {
                            var cvs = canvas.cropper('getCroppedCanvas');
                            var url = cvs.toDataURL("image/png");
                            $('figure').html("<img src='"+gear+"' id='gear'>");
                            runModel(cvs.getContext('2d'),cvs, url);

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
});

function addRow(imgURL, result) {
    var row = $("<tr></tr>");
    i++;
    row.append($("<td>" + i + "</td>"))
    row.append($("<td><img class='preview_img col s3'></canvas></td>"));
    if (result[0] >= .5) {
        row.append($("<td>Benign</td>"));
        row.append($("<td>" + Math.round((result[0] - .5) * 200) + "%</td>"));
    } else {
        row.append($("<td>Malignant</td>"));
        row.append($("<td>" + Math.round((result[1] - .5) * 200) + "%</td>"));
    }

    $(".main").append(row);
    row.find(".preview_img").attr("src", imgURL);
    $('figure').html("");

}

function runModel(ctx, cvs, imgURL) {
    const imageData = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
    );

    const {
        data,
        width,
        height
    } = imageData;

    // data processing
    // see https://github.com/fchollet/keras/blob/master/keras/applications/imagenet_utils.py
    // and https://github.com/fchollet/keras/blob/master/keras/applications/inception_v3.py
    let dataTensor = ndarray(new Float32Array(data), [width, height, 4]);
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
    const inputData = {
        ["input_1"]: dataProcessedTensor.data
    };
    console.log("We started the function!");
    model
        .ready()
        .then(() => {
            // input data object keyed by names of the input layers
            // or `input` for Sequential models
            // values are the flattened Float32Array data
            // (input tensor shapes are specified in the model config)
            // make predictions
            return model.predict(inputData)
            console.log("Ran the Model");
        })
        .then(outputData => {
            // outputData is an object keyed by names of the output layers
            // or `output` for Sequential models
            // e.g.,
            // outputData['fc1000']
            console.log("Model Finished!")
            console.log(outputData);
            addRow(imgURL, outputData["dense_1"]);
        })
        .catch(err => {
        // handle error
        })
}
