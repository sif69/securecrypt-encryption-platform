# 🔐 File Encryptor/Decryptor with Multiprocessing

### File Encryption and Decryption System in C++ using Multiprocessing

---

## 🧩 Overview
This project implements a **file encryption/decryption system in C++** that leverages **multiprocessing** for parallel execution.  
It demonstrates key **Operating System (OS)** concepts like **process management**, **file I/O operations**, and **inter-process communication**.

---

## 🔑 Key OS Concepts Implemented

### 1. Process Management
- **Fork-based Multiprocessing:** Uses `fork()` to create child processes for parallel task execution.  
- **Process Scheduling:** Limits concurrent processes to CPU core count using `sysconf(_SC_NPROCESSORS_ONLN)`.  
- **Process Synchronization:** Parent process manages child processes and waits for their completion.  

### 2. File System Operations
- **File I/O:** Implements binary file handling using `std::fstream`.  
- **Directory Traversal:** Uses `std::filesystem` for recursive directory scanning.  
- **File Permissions:** Handles file access and modification through stream operations.  

### 3. Resource Management
- **File Descriptor Management:** Careful handling of file streams across process boundaries.  
- **Memory Management:** Smart pointers (`std::unique_ptr`) ensure automatic cleanup.  
- **Process Cleanup:** Proper child process reaping to avoid zombie processes.  

---

## 🛠️ Technical Implementation

### Smart Pointer Usage
```cpp
std::queue<std::unique_ptr<Task>> taskQueue;
```

The use of `std::unique_ptr`:
- ✓ Ensures automatic memory deallocation  
- ✓ Prevents memory leaks in task queue management  
- ✓ Enforces unique ownership semantics for `Task` objects  

---

### Makefile Structure
```makefile
CXX = g++
CXXFLAGS = -std=c++17 -g -Wall
MAIN_TARGET = encrypt_decrypt

# Compile commands ensure proper dependency handling
$(MAIN_TARGET): $(OBJECTS)
    $(CXX) $(CXXFLAGS) $^ -o $@
```

---

## 🚧 Implementation Challenges & Solutions

### 1. File Stream Management
**Challenge:** Handling file streams across process boundaries and avoiding duplicate file descriptors.  

**Solution:**
```cpp
// Serialize task before fork
std::string taskStr = taskToExecute->toString();
taskToExecute.reset();  // Close streams before fork
```

---

### 2. Process Synchronization
**Challenge:** Managing concurrent child processes.  

**Solution:**
```cpp
int max_children = sysconf(_SC_NPROCESSORS_ONLN);
while ((int)children.size() >= max_children) {
    int status = 0;
    pid_t done = wait(&status);
}
```

---

## 🚀 Building and Running

### Prerequisites
- G++ compiler with C++17 support  
- Linux/UNIX operating system  
- Make build system  

### Build
```bash
make clean    # Clean previous builds
make          # Build project
```

### Run
```bash
./encrypt_decrypt
# Enter directory path when prompted
# Choose 'encrypt' or 'decrypt'
```

---

## 📁 Project Structure
```
ENCRYPTY/
├── src/
│   └── app/
│       ├── processes/           # Process management
│       │   ├── Task.hpp
│       │   ├── ProcessManagement.hpp
│       │   └── ProcessManagement.cpp
│       ├── fileHandling/        # File I/O
│       │   ├── IO.hpp
│       │   ├── IO.cpp
│       │   └── ReadEnv.cpp
│       └── encryptDecrypt/      # Core logic
│           ├── Cryption.hpp
│           ├── Cryption.cpp
│           └── CryptionMain.cpp
├── Makefile
└── main.cpp
```

---

## 🔧 Error Handling

### File Permission Errors
```bash
chmod +r input_file     # Ensure read permission
chmod +w output_dir     # Ensure write permission
```

### Process Limits
```bash
ulimit -u               # Check process limit
```

---

## 📝 Notes
- Store encryption key in `.env`  
- Binary mode file processing  
- Process pool adapts to CPU cores  
- Uses RAII principles via smart pointers  

---

## 🔄 Compilation Flow
1. Source files → Object files  
2. Object files → Executable  
3. Automatic dependency tracking  
4. Parallel compilation support  

---

## 💡 Future Improvements
- Error recovery for failed child processes  
- Progress reporting  
- Enhanced encryption algorithms  
- Configuration file support  

---

### 📘 For more details
Check the source code documentation and in-line comments for deeper insights.
