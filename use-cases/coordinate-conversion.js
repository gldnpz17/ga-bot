module.exports.convertCoordinates = function konversi(str){
	var error = "Bad argument\n";
	var result = str + ":\n";
	var check = str.split(" ");
	
	if(check[0] !== "konversi") return error;
	
	var mode, from, into;
	if(check[1] === "vektor") mode = 1;
	else if(check[1] === "titik") mode = 2;
	else mode = 0;
	
	for(var i = 0;i<check.length;i++){
		if(check[i] === "dari"){
			if(check[i+1] === "kartesian") from = 1;
			else if(check[i+1] === "silinder") from = 2;
			else if(check[i+1] === "bola") from = 3;
			else from = 0;
		}
		else if(check[i] === "ke"){
			if(check[i+1] === "kartesian") into = 1;
			else if(check[i+1] === "silinder") into = 2;
			else if(check[i+1] === "bola") into = 3;
			else into = 0;
		}
	}
	
	if(mode*from*into == 0) return error;
	if(from == into) return "sama";
	
	var pos, vect;
	check = str.split("(",2);
	check = check[1].split(")",1);
	pos = check[0].split(",");
	for(var i = 0;i<pos.length;i++){
		pos[i] /= 1;
		if(pos[i] == NaN || pos[i] == undefined) return error;
	}
	
	if(mode == 1){
		check = str.split("[",2);
		check = check[1].split("]",1);
		vect = check[0].split(",");
		for(var i = 0;i<vect.length;i++){
			vect[i] /= 1;
			if(vect[i] == NaN || vect[i] == undefined) return error;
		}
	}
	
	result += ">> Konversi titik\n";
	result += "Rumus:\n";
	
	var newpos = [0,0,0];
	if(from == 1){
		if(into == 2){
			// kartesian ke silinder
			newpos[0] = Math.sqrt(pos[0]**2 + pos[1]**2);
			newpos[1] = Math.atan2(pos[1], pos[0])/Math.PI*180;
			newpos[2] = pos[2];
			
			result += ("r".padEnd(3) + "= sqrt( x^2 + y^2 )\n" + " ".padEnd(3) + "= " + newpos[0].toFixed(3) + "\n");
			result += ("\u03C6".padEnd(3) + "= atan( y / x )\n" + " ".padEnd(3) + "= " + newpos[1].toFixed(3) + "\n");
			result += ("z".padEnd(3) + "= z\n" + " ".padEnd(3) + "= " + newpos[2].toFixed(3) + "\n");
		}
		else if(into == 3){
			// kartesian ke bola
			newpos[0] = Math.sqrt(pos[0]**2 + pos[1]**2 + pos[2]**2);
			newpos[1] = Math.atan2(Math.sqrt(pos[0]**2 + pos[1]**2), pos[2])/Math.PI*180;
			newpos[2] = Math.atan2(pos[1], pos[0])/Math.PI*180;
			
			result += ("r".padEnd(3) + "= sqrt( x^2 + y^2 + z^2 )\n" + " ".padEnd(3) + "= " + newpos[0].toFixed(3) + "\n");
			result += ("\u03B8".padEnd(3) + "= atan( (x^2 + y^2) / z )\n" + " ".padEnd(3) + "= " + newpos[1].toFixed(3) + "\n");
			result += ("\u03C6".padEnd(3) + "= atan( y / x )\n" + " ".padEnd(3) + "= " + newpos[2].toFixed(3) + "\n");
		}
	}
	else if(from == 2){
		if(into == 1){
			// silinder ke kartesian
			newpos[0] = pos[0] * Math.cos(pos[1] * Math.PI/180);
			newpos[1] = pos[0] * Math.sin(pos[1] * Math.PI/180);
			newpos[2] = pos[2];
			
			result += ("x".padEnd(3) + "= r * cos(\u03C6)\n" + " ".padEnd(3) + "= " + newpos[0].toFixed(3) + "\n");
			result += ("y".padEnd(3) + "= r * sin(\u03C6)\n" + " ".padEnd(3) + "= " + newpos[1].toFixed(3) + "\n");
			result += ("z".padEnd(3) + "= z\n" + " ".padEnd(3) + "= " + newpos[2].toFixed(3) + "\n");
		}
		else if(into == 3){
			// silinder ke bola
			newpos[0] = Math.sqrt(pos[0]**2 + pos[2]**2);
			newpos[1] = Math.atan2(pos[0], pos[2])/Math.PI*180;
			newpos[2] = pos[1];
			
			result += ("r".padEnd(3) + "= sqrt( r^2 + z^2 )\n" + " ".padEnd(3) + "= " + newpos[0].toFixed(3) + "\n");
			result += ("\u03B8".padEnd(3) + "= atan( r / z )\n" + " ".padEnd(3) + "= " + newpos[1].toFixed(3) + "\n");
			result += ("\u03C6".padEnd(3) + "= \u03C6\n" + " ".padEnd(3) + "= " + newpos[2].toFixed(3) + "\n");
		}
	}
	else if(from == 3){
		if(into == 1){
			// bola ke kartesian
			newpos[0] = pos[0] * sin(pos[1] * Math.PI/180) * cos(pos[2] * Math.PI/180);
			newpos[1] = pos[0] * sin(pos[1] * Math.PI/180) * sin(pos[2] * Math.PI/180);
			newpos[2] = pos[0] * cos(pos[1] * Math.PI/180);
			
			result += ("r".padEnd(3) + "= r * sin(\u03B8) * cos(\u03C6)\n" + " ".padEnd(3) + "= " + newpos[0].toFixed(3) + "\n");
			result += ("\u03B8".padEnd(3) + "= r * sin(\u03B8) * sin(\u03C6)\n" + " ".padEnd(3) + "= " + newpos[1].toFixed(3) + "\n");
			result += ("\u03C6".padEnd(3) + "= r * cos(\u03B8)\n" + " ".padEnd(3) + "= " + newpos[2].toFixed(3) + "\n");
		}
		else if(into == 2){
			// bola ke silinder
			newpos[0] = pos[0] * Math.sin(pos[1] * Math.PI/180);
			newpos[1] = pos[2];
			newpos[2] = pos[0] * Math.cos(pos[1] * Math.PI/180);
			
			result += ("r".padEnd(3) + "= r * sin(\u03B8)\n" + " ".padEnd(3) + "= " + newpos[0].toFixed(3) + "\n");
			result += ("\u03C6".padEnd(3) + "\u03C6\n" + " ".padEnd(3) + "= " + newpos[1].toFixed(3) + "\n");
			result += ("z".padEnd(3) + "= r * cos(\u03B8)\n" + " ".padEnd(3) + "= " + newpos[2].toFixed(3) + "\n");
		}
	}
	
	if(mode == 1){
		result += ">> Konversi vektor\n";
		result += "Rumus:\n";
		
		var m0 = [0,0,0];
		var m1 = [0,0,0];
		var m2 = [0,0,0];
		var newvect = [0,0,0];
		
		if(from == 1){
			if(into == 2){
				// kartesian ke silinder
				m0 = [Math.cos(newpos[1]*Math.PI/180), Math.sin(newpos[1]*Math.PI/180), 0];
				m1 = [-Math.sin(newpos[1]*Math.PI/180), Math.cos(newpos[1]*Math.PI/180), 0];
				m2 = [0, 0, 1];
				
				result += "Ar   |  cos\u03C6   sin\u03C6    0   | Ax\n"; 
				result += "A\u03C6 = | -sin\u03C6   cos\u03C6    0   | Ay\n";
				result += "Az   |   0      0      1   | Az\n";
			}
			else if(into == 3){
				// kartesian ke bola
				m0 = [Math.sin(newpos[1]*Math.PI/180) * Math.cos(newpos[2]*Math.PI/180),
					  Math.sin(newpos[1]*Math.PI/180) * Math.sin(newpos[2]*Math.PI/180),
					  Math.cos(newpos[1]*Math.PI/180)];
				m1 = [Math.cos(newpos[1]*Math.PI/180) * Math.cos(newpos[2]*Math.PI/180),
					  Math.cos(newpos[1]*Math.PI/180) * Math.sin(newpos[2]*Math.PI/180),
					  -Math.sin(newpos[1]*Math.PI/180)];
				m2 = [-Math.sin(newpos[2]*Math.PI/180), Math.cos(newpos[2]*Math.PI/180), 0];

				result += "Ar   |  sin\u03B8cos\u03C6   sin\u03B8sin\u03C6     cos\u03B8   | Ax\n"; 
				result += "A\u03B8 = |  cos\u03B8cos\u03C6   cos\u03B8sin\u03C6    -sin\u03B8   | Ay\n";
				result += "A\u03C6   |   -sin\u03C6       cos\u03C6        0     | Az\n";
			}
		}
		else if(from == 2){
			if(into == 1){
				// silinder ke kartesian
				m0 = [Math.cos(pos[1]*Math.PI/180), -Math.sin(pos[1]*Math.PI/180), 0];
				m1 = [Math.sin(pos[1]*Math.PI/180), Math.cos(pos[1]*Math.PI/180), 0];
				m2 = [0, 0, 1];

				result += "Ax   |  cos\u03C6  -sin\u03C6    0   | Ar\n";
				result += "Ay = |  sin\u03C6   cos\u03C6    0   | A\u03C6\n";
				result += "Az   |   0      0      1   | Az\n";
			}
			else if(into == 3){
				// silinder ke bola
				m0 = [Math.sin(newpos[1]*Math.PI/180), 0, Math.cos(newpos[1]*Math.PI/180)];
				m1 = [Math.cos(newpos[1]*Math.PI/180), 0, -Math.sin(newpos[1]*Math.PI/180)];
				m2 = [0, 1, 0];
				
				result += "Ar   |  sin\u03B8    0     cos\u03B8 | Ar\n";
				result += "A\u03B8 = |  cos\u03B8    0    -sin\u03B8 | A\u03C6\n";
				result += "A\u03C6   |   0      1      0   | Az\n";
			}
		}
		else if(from == 3){
			if(into == 1){
				// bola ke kartesian
				m0 = [Math.sin(pos[1]*Math.PI/180) * Math.cos(pos[2]*Math.PI/180),
					  Math.cos(pos[1]*Math.PI/180) * Math.cos(pos[2]*Math.PI/180),
					  -Math.sin(pos[2]*Math.PI/180)];
				m1 = [Math.sin(pos[1]*Math.PI/180) * Math.sin(pos[2]*Math.PI/180),
					  Math.cos(pos[1]*Math.PI/180) * Math.sin(pos[2]*Math.PI/180),
					  Math.cos(pos[2]*Math.PI/180)];
				m2 = [Math.cos(pos[1]*Math.PI/180), -Math.sin(pos[1]*Math.PI/180), 0];
				
				result += "Ax   |  sin\u03B8cos\u03C6   cos\u03B8cos\u03C6    -sin\u03C6   | Ar\n"; 
				result += "Ay = |  sin\u03B8sin\u03C6   cos\u03B8sin\u03C6     cos\u03C6   | A\u03B8\n";
				result += "Az   |    cos\u03B8      -sin\u03B8        0     | A\u03C6\n";
			}
			else if(into == 2){
				// bola ke silinder
				m0 = [Math.sin(pos[1]*Math.PI/180), Math.cos(pos[1]*Math.PI/180), 0];
				m1 = [0, 0, 1];
				m2 = [Math.cos(pos[1]*Math.PI/180), -Math.sin(pos[1]*Math.PI/180), 0];
				
				result += "Ar   |  sin\u03B8   cos\u03B8    0   | Ar\n";
				result += "A\u03C6 = |   0      0      1   | A\u03B8\n";
				result += "Az   |  cos\u03B8  -sin\u03B8    0   | A\u03C6\n";
			}
		}
		
		result += ("     |" + m0[0].toFixed(3).padStart(7) + m0[1].toFixed(3).padStart(7) + m0[2].toFixed(3).padStart(7) + " |  " + vect[0].toFixed(3) + "\n");
		result += ("   = |" + m1[0].toFixed(3).padStart(7) + m1[1].toFixed(3).padStart(7) + m1[2].toFixed(3).padStart(7) + " |  " + vect[1].toFixed(3) + "\n");
		result += ("     |" + m2[0].toFixed(3).padStart(7) + m2[1].toFixed(3).padStart(7) + m2[2].toFixed(3).padStart(7) + " |  " + vect[2].toFixed(3) + "\n");
		
		newvect[0] = m0[0]*vect[0] + m0[1]*vect[1] + m0[2]*vect[2];
		newvect[1] = m1[0]*vect[0] + m1[1]*vect[1] + m1[2]*vect[2];
		newvect[2] = m2[0]*vect[0] + m2[1]*vect[1] + m2[2]*vect[2];		
		
		result += ("     " + newvect[0].toFixed(5) + "\n");
		result += ("   = " + newvect[1].toFixed(5) + "\n");
		result += ("     " + newvect[2].toFixed(5) + "\n");
	}
	
	result += "\nDONE\n";

	//Use markdown
	result = "```\n" + result;
	result += "```\n"
	
	return result;
}