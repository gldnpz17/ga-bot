module.exports.convertCoordinates = function konversi(str){
	const error = "Error:";
	var result;
	var check;
	var mode, from = 0, into = 0;
	var pos = [0,0,0];
	var vect = [0,0,0];
	
	str = str.toLowerCase();
	result = str + ":\n";
	
	try{
		check = str.split(" ");

		if(check[0] !== "konversi") throw " not a conversion command\n";

		for(let i = 0;i<check.length;i++){
			if(from == 0 && check[i] === "dari"){
				if(check[i+1] === "kartesian") from = 1;
				else if(check[i+1] === "silinder") from = 2;
				else if(check[i+1] === "bola") from = 3;
			}
			else if(into == 0 && check[i] === "ke"){
				if(check[i+1] === "kartesian") into = 1;
				else if(check[i+1] === "silinder") into = 2;
				else if(check[i+1] === "bola") into = 3;
			}
		}
		if(from*into == 0) throw " bad argument\n";
		if(from == into) return "sama";
		
		let start = str.indexOf("["), end = str.indexOf("]");
		if(start != -1 && end != -1){
			// get vector
			if(start >= end) throw " bad argument\n";
			mode = 1; // vector conversion mode
			vect = str.slice(start+1,end).split(",");
			if(vect.length != 3) throw " not a valid 3-D coordinate\n";
			for(let i = 0;i<3;i++){
				if(vect[i].length == 0) throw " not a number\n";
				vect[i] /= 1;
				if( isNaN(vect[i]) ) throw " not a number\n";
			}
		}
		else mode = 0; // position conversion only
		
		start = str.indexOf("("), end = str.indexOf(")");
		if(start != -1 && end != -1){
			// get position
			if(start >= end) throw " bad argument\n";
			pos = str.slice(start+1,end).split(",");
			if(pos.length != 3) throw " not a valid 3-D coordinate\n";
			for(let i = 0;i<3;i++){
				if(pos[i].length == 0) throw " not a number\n";
				pos[i] /= 1;
				if( isNaN(pos[i]) ) throw " not a number\n";
			}			
		}
		else throw " bad argument\n";
	} catch(e){
		return error + e;
	}
	
	result += ">> Konversi titik\n";
	result += "Rumus:\n";
	
	let newpos = [0,0,0];
	if(from == 1){
		if(into == 2){
			// kartesian ke silinder
			newpos[0] = Math.sqrt(pos[0]**2 + pos[1]**2);
			newpos[1] = Math.atan2(pos[1], pos[0])/Math.PI*180;
			newpos[2] = pos[2];
			
			result += ("r  = sqrt( x^2 + y^2 )\n   = " + newpos[0].toFixed(3) + "\n");
			result += ("\u03C6  = atan( y / x )\n   = " + newpos[1].toFixed(3) + "\n"); 
			result += ("z  = z\n   = " + newpos[2].toFixed(3) + "\n");
		}
		else if(into == 3){
			// kartesian ke bola
			newpos[0] = Math.sqrt(pos[0]**2 + pos[1]**2 + pos[2]**2);
			newpos[1] = Math.atan2(Math.sqrt(pos[0]**2 + pos[1]**2), pos[2])/Math.PI*180;
			newpos[2] = Math.atan2(pos[1], pos[0])/Math.PI*180;
			
			result += ("r  = sqrt( x^2 + y^2 + z^2 )\n   = " + newpos[0].toFixed(3) + "\n");
			result += ("\u03B8  = atan( (x^2 + y^2) / z )\n   = " + newpos[1].toFixed(3) + "\n");
			result += ("\u03C6  = atan( y / x )\n   = " + newpos[2].toFixed(3) + "\n");
		}
	}
	else if(from == 2){
		if(into == 1){
			// silinder ke kartesian
			newpos[0] = pos[0] * Math.cos(pos[1] * Math.PI/180);
			newpos[1] = pos[0] * Math.sin(pos[1] * Math.PI/180);
			newpos[2] = pos[2];
			
			result += ("x  = r * cos(\u03C6)\n   = " + newpos[0].toFixed(3) + "\n");
			result += ("y  = r * sin(\u03C6)\n   = " + newpos[1].toFixed(3) + "\n");
			result += ("z  = z\n   = " + newpos[2].toFixed(3) + "\n");
		}
		else if(into == 3){
			// silinder ke bola
			newpos[0] = Math.sqrt(pos[0]**2 + pos[2]**2);
			newpos[1] = Math.atan2(pos[0], pos[2])/Math.PI*180;
			newpos[2] = pos[1];
			
			result += ("r  = sqrt( r^2 + z^2 )\n   = " + newpos[0].toFixed(3) + "\n");
			result += ("\u03B8  = atan( r / z )\n   = " + newpos[1].toFixed(3) + "\n");
			result += ("\u03C6  = \u03C6\n   = " + newpos[2].toFixed(3) + "\n");
		}
	}
	else if(from == 3){
		if(into == 1){
			// bola ke kartesian
			newpos[0] = pos[0] * Math.sin(pos[1] * Math.PI/180) * Math.cos(pos[2] * Math.PI/180);
			newpos[1] = pos[0] * Math.sin(pos[1] * Math.PI/180) * Math.sin(pos[2] * Math.PI/180);
			newpos[2] = pos[0] * Math.cos(pos[1] * Math.PI/180);
			
			result += ("r  = r * sin(\u03B8) * cos(\u03C6)\n   = " + newpos[0].toFixed(3) + "\n");
			result += ("\u03B8  = r * sin(\u03B8) * sin(\u03C6)\n   = " + newpos[1].toFixed(3) + "\n");
			result += ("\u03C6  = r * cos(\u03B8)\n   = " + newpos[2].toFixed(3) + "\n");
		}
		else if(into == 2){
			// bola ke silinder
			newpos[0] = pos[0] * Math.sin(pos[1] * Math.PI/180);
			newpos[1] = pos[2];
			newpos[2] = pos[0] * Math.cos(pos[1] * Math.PI/180);
			
			result += ("r  = r * sin(\u03B8)\n   = " + newpos[0].toFixed(3) + "\n");
			result += ("\u03C6  = \u03C6\n   = " + newpos[1].toFixed(3) + "\n");
			result += ("z  = r * cos(\u03B8)\n   = " + newpos[2].toFixed(3) + "\n");
		}
	}
	
	if(mode){
		result += ">> Konversi vektor\n";
		result += "Rumus:\n";
		
		let m0 = [0,0,0];
		let m1 = [0,0,0];
		let m2 = [0,0,0];
		let newvect = [0,0,0];
		
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
	result += "```\n";
	
	return result;
}
