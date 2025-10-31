#include <iostream>
#include <fstream>
#include <string>
#include <stdexcept>

enum class Action {
    ENCRYPT,
    DECRYPT
};

int main(int argc, char* argv[]) {
    if (argc != 4) {
        std::cerr << "Usage: ./web_cryption <input_file> <output_file> <encrypt|decrypt> <key>" << std::endl;
        return 1;
    }

    std::string inputFile = argv[1];
    std::string outputFile = argv[2];
    std::string actionStr = argv[3];
    std::string keyStr = argv[4];

    // Parse action
    Action action;
    if (actionStr == "encrypt") {
        action = Action::ENCRYPT;
    } else if (actionStr == "decrypt") {
        action = Action::DECRYPT;
    } else {
        std::cerr << "Invalid action. Use 'encrypt' or 'decrypt'" << std::endl;
        return 1;
    }

    // Parse encryption key
    int key = 0;
    try {
        if (keyStr.empty()) {
            throw std::runtime_error("Encryption key is empty");
        }
        long long tmp = std::stoll(keyStr);
        key = static_cast<int>(tmp % 256);
        if (key < 0) key += 256;
    } catch (const std::invalid_argument&) {
        std::cerr << "Invalid encryption key (not a number): " << keyStr << std::endl;
        return 1;
    } catch (const std::out_of_range&) {
        std::cerr << "Encryption key out of range: " << keyStr << std::endl;
        return 1;
    }

    // Open input file in binary mode
    std::ifstream input(inputFile, std::ios::binary);
    if (!input.is_open()) {
        std::cerr << "Failed to open input file: " << inputFile << std::endl;
        return 1;
    }

    // Open output file in binary mode
    std::ofstream output(outputFile, std::ios::binary);
    if (!output.is_open()) {
        std::cerr << "Failed to open output file: " << outputFile << std::endl;
        return 1;
    }

    // Process file
    if (action == Action::ENCRYPT) {
        char ch;
        while (input.get(ch)) {
            ch = (ch + key) % 256;
            output.put(ch);
        }
    } else {
        char ch;
        while (input.get(ch)) {
            ch = (ch - key + 256) % 256;
            output.put(ch);
        }
    }

    input.close();
    output.close();

    std::cout << "Operation completed successfully" << std::endl;
    return 0;
}
