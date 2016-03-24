var canvas,gl,program;

var models = {};
var coins = {};
var overlapMargin = 0.0002;
var screenVisible = 0;
var boundaryX = 0.64, boundaryY = 0.64;
var friction = 1;
var minSpeedLimit = 0.003;
var collisionOffset = 0.02;

var cameraMatrix = makeScale(1, 1, 1);
var MVPMatrix = makeScale(1, 1, 1);

function initViewport(gl, canvas)
{
  gl.viewport(0, 0, canvas.width, canvas.height);
}

function compileShader(gl, shaderSource, shaderType) {
  // Create the shader object
  var shader = gl.createShader(shaderType);
 
  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);
 
  // Compile the shader
  gl.compileShader(shader);
 
  // Check if it compiled
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    // Something went wrong during compilation; get the error
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }
 
  return shader;
}
////////////
function createShaderFromScriptTag(gl, scriptId, opt_shaderType) {
// look up the script tag by id.
		var shaderScript = document.getElementById(scriptId);
		if (!shaderScript) {
  		throw("*** Error: unknown script element" + scriptId);
		}

// extract the contents of the script tag.
		var shaderSource = shaderScript.text;

// If we didn't pass in a type, use the 'type' from
// the script tag.
		if (!opt_shaderType) {
  		if (shaderScript.type == "x-shader/x-vertex") {
    			opt_shaderType = gl.VERTEX_SHADER;
  		} 
  		else if (shaderScript.type == "x-shader/x-fragment") {
    			opt_shaderType = gl.FRAGMENT_SHADER;
  		}
  		else if (!opt_shaderType) {
    			throw("*** Error: shader type not set");
  		}
		}
		return compileShader(gl, shaderSource, opt_shaderType);
};
/////////////////
function createProgram(gl, vertexShader, fragmentShader) {
  // create a program.
  var program = gl.createProgram();
 
  // attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
 
  // link the program.
  gl.linkProgram(program);
 
  // Check if it linked.
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
      // something went wrong with the link
      throw ("program filed to link:" + gl.getProgramInfoLog (program));
  }
 
  return program;
};
//////////////////////////
function createProgramFromScripts(gl, vertexShaderId, fragmentShaderId) {
  var vertexShader = createShaderFromScriptTag(gl, vertexShaderId);
  var fragmentShader = createShaderFromScriptTag(gl, fragmentShaderId);
  return createProgram(gl, vertexShader, fragmentShader);
}

function Initialize()
{
	canvas = document.getElementById("canvas");

	gl = canvas.getContext("experimental-webgl");
	initViewport(gl, canvas);
	// setup a GLSL program
	program = createProgramFromScripts(gl,"2d-vertex-shader", "2d-fragment-shader");
	gl.useProgram(program);

  //Set this MVPMatrix before calling the makeModel function, this can be treated as the camera.
  //**Assuming individual objects won't have any rotation!! To do this store separate matrices for each object
  // which would give us the individual scaling/rotation of each object. 
  //MVPMatrix = makePerspective(180 * (3.14/180), 1, 0, 5000);
  makeModel('boardinner', 0, 0, 0, 1.5, 1.5, 0.03, 0, 0, 0, 'boardinner.data', 0);
  makeModel('boardouter1', 0, 0.75, 0, 1.6, 0.1, 0.15, 0, 0, 0, 'boardouter.data', 0);
  makeModel('boardouter2', 0, -0.75, 0, 1.6, 0.1, 0.15, 0, 0, 0, 'boardouter.data', 0);
  makeModel('boardouter3', -0.75, 0, 0, 0.1, 1.6, 0.15, 0, 0, 0,  'boardouter.data', 0);
  makeModel('boardouter4', 0.75, 0, 0, 0.1, 1.6, 0.15, 0, 0, 0, 'boardouter.data', 0);
  makeModel('boardline', 0, 0, -overlapMargin, 0.97, 0.97, 0.03, 0, 0, 0, 'boardouter.data', 0);
  makeModel('boardline2', 0, 0, -2*overlapMargin, 0.95, 0.95, 0.03, 0, 0, 0, 'boardinner.data', 0);
  makeModel('cylindercenter1', 0, 0, 0, 0.2, 0.2, 0.018, 0, 0, 0, 'cylinder.data', 0);
  makeModel('cylindercenter2', 0, 0, 0, 0.185, 0.185, 0.018+overlapMargin, 0, 0, 0, 'cylinderlight.data', 0);
  makeModel('cylinderside1', -0.45, -0.45, 0, 0.035, 0.035, 0.018, 0, 0, 0, 'cylinder.data', 0);
  makeModel('cylinderside2', -0.45, -0.45, 0, 0.025, 0.025, 0.018+overlapMargin, 0, 0, 0, 'cylinderlight.data', 0);
  makeModel('cylinderside3', 0.45, -0.45, 0, 0.035, 0.035, 0.018, 0, 0, 0, 'cylinder.data', 0);
  makeModel('cylinderside4', 0.45, -0.45, 0, 0.025, 0.025, 0.018+overlapMargin, 0, 0, 0, 'cylinderlight.data', 0);
  makeModel('cylinderside5', -0.45, 0.45, 0, 0.035, 0.035, 0.018, 0, 0, 0, 'cylinder.data', 0);
  makeModel('cylinderside6', -0.45, 0.45, 0, 0.025, 0.025, 0.018+overlapMargin, 0, 0, 0, 'cylinderlight.data', 0);
  makeModel('cylinderside7', 0.45, 0.45, 0, 0.035, 0.035, 0.018, 0, 0, 0, 'cylinder.data', 0);
  makeModel('cylinderside8', 0.45, 0.45, 0, 0.025, 0.025, 0.018+overlapMargin, 0, 0, 0, 'cylinderlight.data', 0);
  makeModel('goal1', -0.66, -0.66, 0, 0.055, 0.055, 0.018, 0, 0, 0, 'cylinder.data', 0);
  makeModel('goal2', 0.66, -0.66, 0, 0.055, 0.055, 0.018, 0, 0, 0, 'cylinder.data', 0);
  makeModel('goal3', -0.66, 0.66, 0, 0.055, 0.055, 0.018, 0, 0, 0, 'cylinder.data', 0);
  makeModel('goal4', 0.66, 0.66, 0, 0.055, 0.055, 0.018, 0, 0, 0, 'cylinder.data', 0);
  makeModel('goal1inner', -0.66, -0.66, 0, 0.05, 0.05, 0.018+overlapMargin, 0, 0, 0, 'cylindergrey.data', 0);
  makeModel('goal2inner', 0.66, -0.66, 0, 0.05, 0.05, 0.018+overlapMargin, 0, 0, 0, 'cylindergrey.data', 0);
  makeModel('goal3inner', -0.66, 0.66, 0, 0.05, 0.05, 0.018+overlapMargin, 0, 0, 0, 'cylindergrey.data', 0);
  makeModel('goal4inner', 0.66, 0.66, 0, 0.05, 0.05, 0.018+overlapMargin, 0, 0, 0, 'cylindergrey.data', 0);
  makeModel('striker', 0, 0, -0.04, 0.05, 0.05, 0.015, 0.15, 0.15, 0, 'cylindergrey.data', 1);
  makeModel('striker2', 0.08, 0.08, -0.04, 0.05, 0.05, 0.015, -0.15, 0.3, 0, 'cylinder.data', 1);
  makeModel('striker3', -0.08, -0.08, -0.04, 0.05, 0.05, 0.015, -0.15, 0.3, 0, 'cylinder.data', 1);
  makeModel('striker4', 0.08, -0.08, -0.04, 0.05, 0.05, 0.015, -0.15, 0.3, 0, 'cylinder.data', 1);
  setInterval(drawScene, 33); //30 fps
}

function isCollidingX(coin1, coin2){
  //console.log(coin1['center'][0],coin2['center'][0]);
  //console.log(coin1['scale'][0],coin2['scale'][0]);
  if(coin1['center'][1]+coin1['scale'][1]/2 + collisionOffset >= coin2['center'][1]-coin2['scale'][1]/2 && coin1['center'][1]-coin1['scale'][1]/2 <= coin2['center'][1]+coin2['scale'][1]/2 + collisionOffset){
    if(coin1['center'][0]+coin1['scale'][0]/2 + collisionOffset >= coin2['center'][0]-coin2['scale'][0]/2 && coin1['center'][0]-coin1['scale'][0]/2 <= coin2['center'][0]+coin2['scale'][0]/2 + collisionOffset)
      return 1;
  }
  return 0;
}

function isCollidingY(coin1, coin2){
  if(coin1['center'][0]+coin1['scale'][0]/2 + collisionOffset >= coin2['center'][0]-coin2['scale'][0]/2 && coin1['center'][0]-coin1['scale'][0]/2 <= coin2['center'][0]+coin2['scale'][0]/2 + collisionOffset){
    if(coin1['center'][1]+coin1['scale'][1]/2 + collisionOffset >= coin2['center'][1]-coin2['scale'][1]/2 && coin1['center'][1]-coin1['scale'][1]/2 <= coin2['center'][1]+coin2['scale'][1]/2 + collisionOffset)
      return 1;
  }
  return 0; 
}

function checkCollisions(){
  for(var key1 in coins){
    for(var key2 in coins){
      if(key1 == key2 || key1 >= key2)
        continue;
      var coin1 = coins[key1];
      var coin2 = coins[key2];
      if(isCollidingX(coin1, coin2)){
        coin1['center'][0] -= coin1['speed'][0];
        coin2['center'][0] -= coin2['speed'][0];        
        coin1['speed'][0] *= -0.9;
        coin2['speed'][0] *= -0.9;
      }
      if(isCollidingY(coin1, coin2)){
        coin1['center'][1] -= coin1['speed'][1];
        coin2['center'][1] -= coin2['speed'][1];
        coin1['speed'][1] *= -0.9;
        coin2['speed'][1] *= -0.9;
      }
      coins[key1] = coin1;
      coins[key2] = coin2;
    }
  }
}

function moveCoins(){
  for(var key in coins){
    var coin1 = coins[key];
    //console.log(coin1['speed'][0], coin1['speed'][1]);
    if (Math.abs(coin1['speed'][0]) <= minSpeedLimit){
      coin1['speed'][0] = 0;
    }
    if (Math.abs(coin1['speed'][1]) <= minSpeedLimit){
      coin1['speed'][1] = 0;
    }
    coin1['center'][0] += coin1['speed'][0];
    if (coin1['center'][0] >= boundaryX){
      coin1['center'][0] = boundaryX;
      coin1['speed'][0] *= -0.7;
    }
    if (coin1['center'][0] <= -boundaryX){
      coin1['center'][0] = -boundaryX;
      coin1['speed'][0] *= -0.7;
    }
    coin1['center'][1] += coin1['speed'][1];
    if (coin1['center'][1] >= boundaryY){
      coin1['center'][1] = boundaryY;
      coin1['speed'][1] *= -0.7;
    }
    if (coin1['center'][1] <= -boundaryY){
      coin1['center'][1] = -boundaryY;
      coin1['speed'][1] *= -0.7;
    }
    coin1['speed'][0] *= friction;
    coin1['speed'][1] *= friction;
    coins[key] = coin1;
  }
}

var temp = 0;

// 0 1 2 3        0 1 2 3
// 4 5 6 7        4 5 6 7
// 8 9 10 11      8 9 10 11
// 12 13 14 15    12 13 14 15
function matrixMultiply(mat1, mat2){
  return [
    mat1[0]*mat2[0]+mat1[1]*mat2[4]+mat1[2]*mat2[8]+mat1[3]*mat2[12],
    mat1[0]*mat2[1]+mat1[1]*mat2[5]+mat1[2]*mat2[9]+mat1[3]*mat2[13],
    mat1[0]*mat2[2]+mat1[1]*mat2[6]+mat1[2]*mat2[10]+mat1[3]*mat2[14],
    mat1[0]*mat2[3]+mat1[1]*mat2[7]+mat1[2]*mat2[11]+mat1[3]*mat2[15],
    mat1[4]*mat2[0]+mat1[5]*mat2[4]+mat1[6]*mat2[8]+mat1[7]*mat2[12],
    mat1[4]*mat2[1]+mat1[5]*mat2[5]+mat1[6]*mat2[9]+mat1[7]*mat2[13],
    mat1[4]*mat2[2]+mat1[5]*mat2[6]+mat1[6]*mat2[10]+mat1[7]*mat2[14],
    mat1[4]*mat2[3]+mat1[5]*mat2[7]+mat1[6]*mat2[11]+mat1[7]*mat2[15],
    mat1[8]*mat2[0]+mat1[9]*mat2[4]+mat1[10]*mat2[8]+mat1[11]*mat2[12],
    mat1[8]*mat2[1]+mat1[9]*mat2[5]+mat1[10]*mat2[9]+mat1[11]*mat2[13],
    mat1[8]*mat2[2]+mat1[9]*mat2[6]+mat1[10]*mat2[10]+mat1[11]*mat2[14],
    mat1[8]*mat2[3]+mat1[9]*mat2[7]+mat1[10]*mat2[11]+mat1[11]*mat2[15],
    mat1[12]*mat2[0]+mat1[13]*mat2[4]+mat1[14]*mat2[8]+mat1[15]*mat2[12],
    mat1[12]*mat2[1]+mat1[13]*mat2[5]+mat1[14]*mat2[9]+mat1[15]*mat2[13],
    mat1[12]*mat2[2]+mat1[13]*mat2[6]+mat1[14]*mat2[10]+mat1[15]*mat2[14],
    mat1[12]*mat2[3]+mat1[13]*mat2[7]+mat1[14]*mat2[11]+mat1[15]*mat2[15]
  ];
}

var temp = 0.0;

function drawScene(){
  screenVisible = 1;
  checkCollisions();
  moveCoins();
  for(var key in models){
    var model = models[key];
    //console.log(model);
    temp += 0.05
    //cameraMatrix = makeScale(0.56, 0.56, 0.56);
    //cameraMatrix = matrixMultiply(cameraMatrix, makeXRotation(90 * (3.14/180)));
    //cameraMatrix = matrixMultiply(cameraMatrix, makeYRotation(temp * (3.14/180)));
    //cameraMatrix = matrixMultiply(cameraMatrix, makeXRotation(-40 * (3.14/180)));
    MVPMatrix = matrixMultiply(cameraMatrix, makeZToWMatrix(0.9));
    createModel(model['name'], model['center'][0], model['center'][1], model['center'][2], model['scale'][0],  model['scale'][1],  model['scale'][2], model['speed'][0], model['speed'][1], model['speed'][2], model['filedata'], model['filename'], model['iscoin']);
  }
  for(var key in coins){
    var model = coins[key];
    //console.log(model);
    temp += 0.05
    cameraMatrix = makeScale(0.56, 0.56, 0.56);
    //cameraMatrix = matrixMultiply(cameraMatrix, makeXRotation(90 * (3.14/180)));
    //cameraMatrix = matrixMultiply(cameraMatrix, makeYRotation(temp * (3.14/180)));
    //cameraMatrix = matrixMultiply(cameraMatrix, makeXRotation(-40 * (3.14/180)));
    MVPMatrix = matrixMultiply(cameraMatrix, makeZToWMatrix(0.9));
    createModel(model['name'], model['center'][0], model['center'][1], model['center'][2], model['scale'][0],  model['scale'][1],  model['scale'][2], model['speed'][0], model['speed'][1], model['speed'][2], model['filedata'], model['filename'], model['iscoin']);
  }
}

function makePerspective(fieldOfViewInRadians, aspect, near, far) {
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
  var rangeInv = 1.0 / (near - far);
 
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0
  ];
};

function makeZToWMatrix(fudgeFactor) {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, fudgeFactor,
    0, 0, 0, 1,
  ];
}

function makeTranslation(tx, ty, tz) {
  return [
     1,  0,  0,  0,
     0,  1,  0,  0,
     0,  0,  1,  0,
     tx, ty, tz, 1
  ];
}
 
function makeXRotation(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
 
  return [
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1
  ];
};
 
function makeYRotation(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
 
  return [
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1
  ];
};
 
function makeZRotation(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
 
  return [
     c, s, 0, 0,
    -s, c, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1,
  ];
}
 
function makeScale(sx, sy, sz) {
  return [
    sx, 0,  0,  0,
    0, sy,  0,  0,
    0,  0, sz,  0,
    0,  0,  0,  1,
  ];
}

function openFile(name, x_pos, y_pos, z_pos, x_scale, y_scale, z_scale, speed_x, speed_y, speed_z, filename, iscoin){
  var datastring;
  $.ajax({
    url : filename,
    dataType: "text",
    success : function (data) {
      datastring = data;
      createModel(name, x_pos, y_pos, z_pos, x_scale, y_scale, z_scale, speed_x, speed_y, speed_z, datastring, filename, iscoin);
    }
  });
}

function makeModel(name, x_pos, y_pos, z_pos, x_scale, y_scale, z_scale, speed_x, speed_y, speed_z, filename, iscoin){
  openFile(name, x_pos, y_pos, z_pos, x_scale, y_scale, z_scale, speed_x, speed_y, speed_z, filename, iscoin);
}

function createModel(name, x_pos, y_pos, z_pos, x_scale, y_scale, z_scale, speed_x, speed_y, speed_z, filedata, filename, iscoin) //Create object from blender
{
    var vertex_buffer_data = [];
    var color_buffer_data = [];
    var points = [];
    var len=0;
    var line;
    var a,b,c;
    var start=0;
    var lines = filedata.split('\n');
    for (var j=0; j<lines.length; j++){
      var words = lines[j].split(' ');
      if(words[0] == "v"){
          var cur_point = {};
          cur_point['x']=parseFloat(words[1]);
          cur_point['y']=parseFloat(words[2]);
          cur_point['z']=parseFloat(words[3]);
          //console.log(words);
          points.push(cur_point);
      }
    }
    //console.log(points);
    var temp;
    var lines = filedata.split('\n');
    for (var jj=0; jj<lines.length; jj++){
      var words = lines[jj].split(' ');
      if(words[0] == "f"){
          var t = [];
          var linemod = lines[jj].substring(1);
          var j,ans=0,tt=0,state=0;
          for(j=0;j<linemod.length;j++){
              if(linemod[j]==' '){
                  ans=0;
                  state=1;
              }
              else if(linemod[j]=='/' && ans!=0 && state==1){
                  t.push(ans);
                  state=0;
              }
              else if(linemod[j]!='/'){
                  ans=ans*10+linemod.charCodeAt(j)-'0'.charCodeAt(0);
              }
          }
          t.push(ans);
          var my_triangle = {};
          my_triangle['p1'] = t[0]-1;
          my_triangle['p2'] = t[1]-1;
          my_triangle['p3'] = t[2]-1;
          vertex_buffer_data.push(points[my_triangle['p1']]['x']*x_scale + x_pos);
          vertex_buffer_data.push(points[my_triangle['p1']]['y']*y_scale + y_pos);
          vertex_buffer_data.push(points[my_triangle['p1']]['z']*z_scale + z_pos);
          vertex_buffer_data.push(points[my_triangle['p2']]['x']*x_scale + x_pos);
          vertex_buffer_data.push(points[my_triangle['p2']]['y']*y_scale + y_pos);
          vertex_buffer_data.push(points[my_triangle['p2']]['z']*z_scale + z_pos);
          vertex_buffer_data.push(points[my_triangle['p3']]['x']*x_scale + x_pos);
          vertex_buffer_data.push(points[my_triangle['p3']]['y']*y_scale + y_pos);
          vertex_buffer_data.push(points[my_triangle['p3']]['z']*z_scale + z_pos);
      }
      if(words[0] == 'c'){
          var r1,g1,b1,r2,g2,b2,r3,g3,b3;
          r1 = words[1]; g1 = words[2]; b1 = words[3];
          r2 = words[4]; g2 = words[5]; b2 = words[6];
          r3 = words[7]; g3 = words[8]; b3 = words[9];      
          color_buffer_data.push(r1/255.0);
          color_buffer_data.push(g1/255.0);
          color_buffer_data.push(b1/255.0);
          color_buffer_data.push(1.0);
          color_buffer_data.push(r2/255.0);
          color_buffer_data.push(g2/255.0);
          color_buffer_data.push(b2/255.0);
          color_buffer_data.push(1.0);
          color_buffer_data.push(r3/255.0);
          color_buffer_data.push(g3/255.0);
          color_buffer_data.push(b3/255.0);
          color_buffer_data.push(1.0);
      }
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    var vertexColor = gl.getAttribLocation(program, "a_color");
    var colorbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_buffer_data), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(vertexColor);
    gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_buffer_data), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    var u_matrix = gl.getUniformLocation(program, "u_matrix");
    //matrix = matrixMultiply(matrix, makeYRotation(69 * (3.14/180)));
    gl.uniformMatrix4fv(u_matrix, false, MVPMatrix);

    //console.log(vertex_buffer_data);
    //console.log(vertex_buffer_data.length);

    // draw
    if (screenVisible == 1){
      gl.drawArrays(gl.TRIANGLES, 0, vertex_buffer_data.length/3);
    }
    var mymodel = {'center':[x_pos,y_pos,z_pos], 'scale':[x_scale,y_scale,z_scale], 'speed':[speed_x, speed_y, speed_z], 'name':name, 'filedata':filedata, 'filename':filename, 'iscoin':iscoin};
    if (!iscoin){
      models[name] = mymodel;
    }
    else{
      coins[name] = mymodel;
    }
}