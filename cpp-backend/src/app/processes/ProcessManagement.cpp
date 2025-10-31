#include <iostream>
#include "ProcessManagement.hpp"
#include <unistd.h>
#include <cstring>
#include <sys/wait.h>
#include <vector>
#include <algorithm>
#include "../encryptDecrypt/Cryption.hpp"

ProcessManagement::ProcessManagement() {}

bool ProcessManagement::submitToQueue(std::unique_ptr<Task> task) {
    taskQueue.push(std::move(task));
    return true;
}

void ProcessManagement::executeTasks() {
    // concurrency limit = number of online processors (at least 1)
    int max_children = sysconf(_SC_NPROCESSORS_ONLN);
    if (max_children < 1) max_children = 1;

    std::vector<pid_t> children;

    while (!taskQueue.empty()) {
        std::unique_ptr<Task> taskToExecute = std::move(taskQueue.front());
        taskQueue.pop();

        // Serialize task; we'll destroy taskToExecute before forking to avoid duplicating open file descriptors
        std::string taskStr = taskToExecute->toString();
        std::cout << "Executing task: " << taskStr << std::endl;

        // destroy the Task (closes streams etc.) before forking
        taskToExecute.reset();

        // if too many children, wait for at least one to finish
        while ((int)children.size() >= max_children) {
            int status = 0;
            pid_t done = wait(&status); // blocks until any child exits
            if (done > 0) {
                children.erase(std::remove(children.begin(), children.end(), done), children.end());
            }
        }

        pid_t pid = fork();
        if (pid < 0) {
            // fork failed — handle error and continue with next task
            std::cerr << "Failed to fork for task: " << taskStr << " — continuing\n";
            continue;
        } else if (pid == 0) {
            // child process: run the cryption logic and exit with appropriate status
            try {
                int ret = executeCryption(taskStr);
                _exit(ret == 0 ? EXIT_SUCCESS : EXIT_FAILURE);
            } catch (const std::exception &e) {
                std::cerr << "Child error executing task '" << taskStr << "': " << e.what() << std::endl;
                _exit(EXIT_FAILURE);
            } catch (...) {
                std::cerr << "Child unknown error executing task '" << taskStr << "'" << std::endl;
                _exit(EXIT_FAILURE);
            }
        } else {
            // parent: track child pid and continue (non-blocking)
            children.push_back(pid);
        }
    }

    // reap any remaining children
    for (pid_t p : children) {
        int status = 0;
        waitpid(p, &status, 0);
    }
}