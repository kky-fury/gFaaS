# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.25

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:

#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:

# Disable VCS-based implicit rules.
% : %,v

# Disable VCS-based implicit rules.
% : RCS/%

# Disable VCS-based implicit rules.
% : RCS/%,v

# Disable VCS-based implicit rules.
% : SCCS/s.%

# Disable VCS-based implicit rules.
% : s.%

.SUFFIXES: .hpux_make_needs_suffix_list

# Command-line flag to silence nested $(MAKE).
$(VERBOSE)MAKESILENT = -s

#Suppress display of executed commands.
$(VERBOSE).SILENT:

# A target that is always out of date.
cmake_force:
.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /usr/local/Cellar/cmake/3.25.0/bin/cmake

# The command to remove a file.
RM = /usr/local/Cellar/cmake/3.25.0/bin/cmake -E rm -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20

# Include any dependencies generated for this target.
include CMakeFiles/xfaas_function_cpp20.dir/depend.make
# Include any dependencies generated by the compiler for this target.
include CMakeFiles/xfaas_function_cpp20.dir/compiler_depend.make

# Include the progress variables for this target.
include CMakeFiles/xfaas_function_cpp20.dir/progress.make

# Include the compile flags for this target's objects.
include CMakeFiles/xfaas_function_cpp20.dir/flags.make

CMakeFiles/xfaas_function_cpp20.dir/main.cpp.o: CMakeFiles/xfaas_function_cpp20.dir/flags.make
CMakeFiles/xfaas_function_cpp20.dir/main.cpp.o: main.cpp
CMakeFiles/xfaas_function_cpp20.dir/main.cpp.o: CMakeFiles/xfaas_function_cpp20.dir/compiler_depend.ts
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object CMakeFiles/xfaas_function_cpp20.dir/main.cpp.o"
	/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -MD -MT CMakeFiles/xfaas_function_cpp20.dir/main.cpp.o -MF CMakeFiles/xfaas_function_cpp20.dir/main.cpp.o.d -o CMakeFiles/xfaas_function_cpp20.dir/main.cpp.o -c /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20/main.cpp

CMakeFiles/xfaas_function_cpp20.dir/main.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/xfaas_function_cpp20.dir/main.cpp.i"
	/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20/main.cpp > CMakeFiles/xfaas_function_cpp20.dir/main.cpp.i

CMakeFiles/xfaas_function_cpp20.dir/main.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/xfaas_function_cpp20.dir/main.cpp.s"
	/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20/main.cpp -o CMakeFiles/xfaas_function_cpp20.dir/main.cpp.s

# Object files for target xfaas_function_cpp20
xfaas_function_cpp20_OBJECTS = \
"CMakeFiles/xfaas_function_cpp20.dir/main.cpp.o"

# External object files for target xfaas_function_cpp20
xfaas_function_cpp20_EXTERNAL_OBJECTS =

xfaas_function_cpp20: CMakeFiles/xfaas_function_cpp20.dir/main.cpp.o
xfaas_function_cpp20: CMakeFiles/xfaas_function_cpp20.dir/build.make
xfaas_function_cpp20: CMakeFiles/xfaas_function_cpp20.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Linking CXX executable xfaas_function_cpp20"
	$(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/xfaas_function_cpp20.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
CMakeFiles/xfaas_function_cpp20.dir/build: xfaas_function_cpp20
.PHONY : CMakeFiles/xfaas_function_cpp20.dir/build

CMakeFiles/xfaas_function_cpp20.dir/clean:
	$(CMAKE_COMMAND) -P CMakeFiles/xfaas_function_cpp20.dir/cmake_clean.cmake
.PHONY : CMakeFiles/xfaas_function_cpp20.dir/clean

CMakeFiles/xfaas_function_cpp20.dir/depend:
	cd /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20 && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20 /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20 /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20 /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20 /Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20/CMakeFiles/xfaas_function_cpp20.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : CMakeFiles/xfaas_function_cpp20.dir/depend

