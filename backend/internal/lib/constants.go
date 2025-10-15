package lib

import (
	"app/internal/models"
)

var Languages = []models.Languages{
	{
		Language: "Python 3.11",
		Code:     "python",
		MonacoId: "python",
		DefaultCode: `# Write your solution here
def solution():
    pass

if __name__ == "__main__":
    solution()
`,
	},
	{
		Language: "Java 17",
		Code:     "java",
		MonacoId: "java",
		DefaultCode: `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
    }
}
`,
	},
	{
		Language: "C++17",
		Code:     "cpp",
		MonacoId: "cpp",
		DefaultCode: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}
`,
	},
}
