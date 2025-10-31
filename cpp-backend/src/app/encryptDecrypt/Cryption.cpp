#include "Cryption.hpp"
#include "../processes/Task.hpp"
#include "../fileHandling/ReadEnv.cpp" // consider changing to a header include instead

int executeCryption(const std::string& taskData) {
    Task task = Task::fromString(taskData);
    ReadEnv env;
    std::string envKey = env.getenv();

    // trim whitespace/newlines from envKey
    auto trim = [](std::string s) {
        const char* ws = " \t\n\r\f\v";
        s.erase(0, s.find_first_not_of(ws));
        s.erase(s.find_last_not_of(ws) + 1);
        return s;
    };
    envKey = trim(envKey);

    // robust parse with clear errors
    int key = 0;
    try {
        if (envKey.empty()) {
            throw std::runtime_error("Encryption key is empty (contents of .env: '" + envKey + "')");
        }
        // use stoll to detect very large numbers, then reduce to range if needed
        long long tmp = std::stoll(envKey);
        // map to 0..255 because code uses modulo 256
        key = static_cast<int>(tmp % 256);
        if (key < 0) key += 256;
    } catch (const std::invalid_argument&) {
        throw std::runtime_error("Invalid encryption key (not a number): '" + envKey + "'");
    } catch (const std::out_of_range&) {
        throw std::runtime_error("Encryption key out of range: '" + envKey + "'");
    }

    if (task.action == Action::ENCRYPT) {
        char ch;
        while (task.f_stream.get(ch)) {
            ch = (ch + key) % 256;
            task.f_stream.seekp(-1, std::ios::cur);
            task.f_stream.put(ch);
        }
        task.f_stream.close();
    } else {
        char ch;
        while (task.f_stream.get(ch)) {
            ch = (ch - key + 256) % 256;
            task.f_stream.seekp(-1, std::ios::cur);
            task.f_stream.put(ch);
        }
        task.f_stream.close();
    }
    return 0;
}