function uploadFile() {

    var fd = new FormData();

    var chkBox = document.getElementById('toCropOrNotToCrop');
    if (chkBox.checked) {
        fd.append('autoCrop', 'True');
    }
    else {
        fd.append('autoCrop', 'False');
    }

    file = document.getElementById('fileToUpload').files[0];

    if (file == null) {
        console.log('File Doesnt Exist');
    }
    else {

        fd.append('image', file);

        var xhr = new XMLHttpRequest();

        xhr.open("POST", "http://70.91.137.60:8080/cancer");

        xhr.onload = function () {
            document.getElementById('output').innerHTML = xhr.response;
            document.getElementById('loading').innerHTML = "";
        };

        //document.getElementById('loading').innerHTML = "<img href='images/gearcogs.png' id='gears'>";
        var elem = document.createElement("img");
        elem.setAttribute("src", "images/gearcogs.png");
        elem.setAttribute("id", "loading_img")
        document.getElementById("loading").appendChild(elem);

        xhr.send(fd);
    }
}
