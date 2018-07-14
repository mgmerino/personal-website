/*
 MIT License

 Copyright (c) 2018 Manuel González

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

// main threejs vars
let scene, camera, renderer;
let geometry, material, mesh;

// clock radius
let radius = 75;

// animation index
let lastTime = 0;

// resize control
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

buildScene();
buildClock();
animate();

function buildScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(255, 255, 255)");
    camera = new THREE.PerspectiveCamera( 15, window.innerWidth / window.innerHeight, 1, 10000 );
    //camera.position.z = 1000;
    camera.position.set(0, 0, 1700);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function buildClock() {

    // clock and clock's sphere groups to ease handle
    let clock = new THREE.Group();
    let clockSphere = new THREE.Group();

    clock.name = "mainClock";

    // build the 3d model wireframed
    let circleGeometry = new THREE.CylinderGeometry(radius, radius, 15, 12);
    let circleMaterial = new THREE.MeshBasicMaterial({color: 0x00000, wireframe: true, transparent: true, opacity: 0.1});
    let circle = new THREE.Mesh(new THREE.WireframeGeometry(circleGeometry), circleMaterial);

    // create background cover and draw a gradient using helper function
    let clockCoverGeometry = new THREE.CircleGeometry(radius, 220);
    let clockCoverMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors, transparent: true, opacity: 0.5 });
    let clockCover = new THREE.Mesh(makeGradientCircle(clockCoverGeometry), clockCoverMaterial);

    // rotate clock cylinder to align along the clock needles
    let xAxis = new THREE.Vector3(1, 0, 0);
    rotateAroundObjectAxis(circle, xAxis, Math.PI/2);

    clock.add(circle);
    clock.add(clockCover);
    scene.add(clock);
    scene.add(clockSphere);


    // sphere markers
    for(let i = 0; i <= 60; i++){
        let lineGeometry = new THREE.Geometry();
        let lenght, thickness;

        lenght = radius - (i % 5 == 0 ? 7 : 4);
        thickness = (i % 5 == 0 ? 3 : 1);

        lineGeometry.vertices.push(new THREE.Vector3(0, radius, 0));
        lineGeometry.vertices.push(new THREE.Vector3(0, lenght, 0));
        let material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: thickness});
        let marker = new THREE.Line(lineGeometry, material);
        marker.rotateZ(6 * i * (2*Math.PI/360));
        clock.add(marker);
        clockSphere.add(marker);

        //let text = new THREE.MeshText2D("Hello world!", { align: 'right', font: '30px Arial', fillStyle: '#000000', antialias: true })
        //scene.add(text)
    }

    // seconds needle
    let sNLineGeometry = new THREE.Geometry();
    sNLineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    sNLineGeometry.vertices.push(new THREE.Vector3(0, radius-10, 0));
    let sNMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
    let sNeedle = new THREE.Line(sNLineGeometry, sNMaterial);
    sNeedle.name = "sNeedle";

    // minutes needle
    let mNLineGeometry = new THREE.Geometry();
    mNLineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    mNLineGeometry.vertices.push(new THREE.Vector3(0, radius-25, 0));
    let mNMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
    let mNeedle = new THREE.Line(mNLineGeometry, mNMaterial);
    mNeedle.name = "mNeedle";

    // hour needle
    let hNlineGeometry = new THREE.Geometry();
    hNlineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    hNlineGeometry.vertices.push(new THREE.Vector3(0, radius-40, 0));
    let hNMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 2});
    let hNeedle = new THREE.Line(hNlineGeometry, hNMaterial);
    hNeedle.name = "hNeedle";

    clock.add(sNeedle);
    clock.add(mNeedle);
    clock.add(hNeedle);

    clockSphere.add(sNeedle);
    clockSphere.add(mNeedle);
    clockSphere.add(hNeedle);

    // put together into same object
    let wholeClock = new THREE.Group();
    wholeClock.name = 'wholeClock';
    wholeClock.add(clock);
    wholeClock.add(clockSphere);

    // reposition pieces
    clockSphere.translateZ(8);
    clockCover.translateZ(-8);
    wholeClock.translateY(-50);

    scene.add(wholeClock);

    // spin off renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );

}

function animate(currentTime) {

    requestAnimationFrame(animate);

    let sn = scene.getObjectByName("sNeedle");
    let mn = scene.getObjectByName("mNeedle");
    let hn = scene.getObjectByName("hNeedle");

    let d1 = new Date();

    let axis = new THREE.Vector3( 0, 0, 1 );
    if(currentTime >= lastTime + 1000){
        lastTime = currentTime;
        sn.setRotationFromAxisAngle(axis, (Math.floor((Date.now()/1000))) * 6 * (2 * Math.PI / -360));
        mn.setRotationFromAxisAngle(axis, (Date.now()/60000) * 6 * (2 * Math.PI / -360));
        hn.setRotationFromAxisAngle(axis, ((Math.round((d1.getTime())/3600000)) * 30 * (2 * Math.PI / -360)) + 30 * (2 * Math.PI / -360));
    }
    /*let clock = scene.getObjectByName("wholeClock");
    clock.rotation.x += .005;
    clock.rotation.y += .001;
    cl ock.rotation.z += .002;*/

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (- mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

// helpers

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

// gradient maker

function makeGradientCircle(geometry){
    let faces = geometry.faces;
    let segmentLength = faces.length;
    faces.forEach(function(face, index){
        let color = new THREE.Color().setHSL(index / segmentLength, 1, 0.5);
        face.vertexColors.push(color);
        face.vertexColors.push(color);
        face.vertexColors.push(color);
    });
    geometry.colorsNeedUpdate = true;

    return geometry;
}

// rotation matrix
function rotateAroundObjectAxis(object, axis, radians) {
    let rotObjectMatrix;
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
}
