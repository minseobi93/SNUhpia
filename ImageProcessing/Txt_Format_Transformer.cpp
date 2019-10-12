#include <stdio.h>
#include <unistd.h>
#include <string>
#include <dirent.h>
#include <iostream>
#include <fcntl.h>
#include <stdlib.h>
#include <fstream>
#define MAX_PATH 1024

using namespace std;

string line_trimmer(string line) {
 
 int comma = 0;
 
 for (int i=0;i<line.length();i++) if (line[i] == ',') comma++;

 if (comma == 1) return line; // No problem
 else if (comma == 2) return line.substr(0,line.length()-2); // Remove last comma
 else { 
	 
	 string value = "", index = "", result = "";
	 bool value_inspect = false, value_recorded = false, ignore = false;
	
	 for (int j=0;j<line.length();j++) {
		 
	   if (line[j] == ',') {
			 if (value_recorded || line[j+1] == ',') { 
				 ignore = true;
				 break;
		      }	  
		     index += " "; // Spacing between Index  
			 value_inspect = true;
			 continue;
	   }	 
	   if (ignore) break;
	   if (value_inspect) {
			 if (line[j] == ' ') {      // null
				 if (!value_recorded) {  //just spacing
					  index += line[j];
					  continue;
			     }
			 }	 
			 // arithmetic operations digits, floating point, sign
	   else if ((line[j]>= '0' && line[j]<= '9')|| (line[j] == '.') || (line[j] == '-') ) {
				 value += line[j]; 
				 value_recorded = true;
				 continue;
	   } 
	   else {
			     value_recorded = false; 
	   }
	  }
	   index += line[j];
	}
	 
	 if (index[index.length()-1] == ' ') index = index.substr(0,index.length()-1);
	    result = index + "," + value;
	    return result;
	 
 }
 
  return line; 
}

int main(int argc, char **argv){
  
    struct dirent* entry;
    struct dirent* file_entry;
    char cwd[MAX_PATH];
    getcwd(cwd, sizeof(cwd));
    strcat(cwd,"/");
    char* path = strcat(cwd,argv[1]); //Users/minseob/Desktop/c++/SNU_PFT
    DIR* dir = opendir(cwd);
    chdir(path);
    
    
    while ((entry = readdir(dir)) != NULL) {
	
	if (!strcmp(entry->d_name, ".") || !strcmp(entry->d_name, "..")) continue;	
	if (entry->d_type != DT_DIR) continue; // 
	
	    char temp_path[MAX_PATH]; 
	    char* folder = entry->d_name;
	    strcpy(temp_path, path);
	    strcat(path,"/");
	    strcat(path,folder);
	    DIR* dir2 = opendir(path);
	    chdir(path);
		
	    while ((file_entry = readdir(dir2)) != NULL) {   // go into a folder 
			
		  if (!strcmp(file_entry->d_name, ".") || !strcmp(file_entry->d_name, "..")) continue;	
		      string file_name = file_entry->d_name;
		      string file_extension = file_name.substr(file_name.length()-3,file_name.length()-1);
		  if (file_extension == "txt") { 
			  string line = "";
	          ifstream in(file_name);
	          file_name = file_name.substr(0,file_name.length()-4);
	          file_name += "_modified.txt"; 
	          ofstream out(file_name);
	          while(getline(in,line)) out << line_trimmer(line)<<endl;
	          in.close();
	          out.close();
		  }
		} 
		strcpy(path,temp_path);
	    chdir(temp_path); 
    }


	return 0;
}
