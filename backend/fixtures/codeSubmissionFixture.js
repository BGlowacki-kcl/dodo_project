export const codeAnswers = {
    "Reverse String": {
        python: `def reverseString(s: list) -> None:
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left, right = left + 1, right - 1`,
        cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
        int left = 0, right = s.size() - 1;
        while (left < right) {
            swap(s[left++], s[right--]);
        }
    }
};`,
        javascript: `var reverseString = function(s) {
    let left = 0, right = s.length - 1;
    while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
};`
    },
    "Two Sum": {
        python: `def twoSum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        if target - num in lookup:
            return [lookup[target - num], i]
        lookup[num] = i`,
        cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> lookup;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (lookup.find(complement) != lookup.end())
                return {lookup[complement], i};
            lookup[nums[i]] = i;
        }
        return {};
    }
};`,
        javascript: `var twoSum = function(nums, target) {
    const lookup = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (lookup.hasOwnProperty(complement))
            return [lookup[complement], i];
        lookup[nums[i]] = i;
    }
};`
    },
    "Longest Substring Without Repeating Characters": {
        python: `def lengthOfLongestSubstring(s: str) -> int:
    char_index = {}
    longest = 0
    start = 0
    for i, char in enumerate(s):
        if char in char_index and char_index[char] >= start:
            start = char_index[char] + 1
        char_index[char] = i
        longest = max(longest, i - start + 1)
    return longest`,
        cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> index(128, -1);
        int longest = 0, start = 0;
        for (int i = 0; i < s.size(); i++) {
            start = max(start, index[s[i]] + 1);
            longest = max(longest, i - start + 1);
            index[s[i]] = i;
        }
        return longest;
    }
};`,
        javascript: `var lengthOfLongestSubstring = function(s) {
    let maxLen = 0, start = 0;
    const map = {};
    for (let i = 0; i < s.length; i++) {
        if (map[s[i]] >= start) {
            start = map[s[i]] + 1;
        }
        map[s[i]] = i;
        maxLen = Math.max(maxLen, i - start + 1);
    }
    return maxLen;
};`
    },
    "Rotate Image": {
        python: `def rotate(matrix: List[List[int]]) -> None:
    n = len(matrix)
    for i in range(n):
        for j in range(i, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()`,
        cpp: `class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                swap(matrix[i][j], matrix[j][i]);
            }
            reverse(matrix[i].begin(), matrix[i].end());
        }
    }
};`,
        javascript: `var rotate = function(matrix) {
    const n = matrix.length;
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
        matrix[i].reverse();
    }
};`
    },
    "Median of Two Sorted Arrays": {
        python: `def findMedianSortedArrays(nums1, nums2):
    A, B = nums1, nums2
    if len(A) > len(B):
        A, B = B, A
    total = len(A) + len(B)
    half = total // 2
    l, r = 0, len(A) - 1
    while True:
        i = (l + r) // 2
        j = half - i - 2
        Aleft = A[i] if i >= 0 else float("-infinity")
        Aright = A[i+1] if (i+1) < len(A) else float("infinity")
        Bleft = B[j] if j >= 0 else float("-infinity")
        Bright = B[j+1] if (j+1) < len(B) else float("infinity")
        if Aleft <= Bright and Bleft <= Aright:
            if total % 2:
                return min(Aright, Bright)
            return (max(Aleft, Bleft) + min(Aright, Bright)) / 2
        elif Aleft > Bright:
            r = i - 1
        else:
            l = i + 1`,
        cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if(nums1.size() > nums2.size())
            return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size(), half = (m+n+1)/2;
        int l = 0, r = m;
        while(l <= r) {
            int i = (l+r)/2;
            int j = half - i;
            int Aleft = (i == 0) ? INT_MIN : nums1[i-1];
            int Aright = (i == m) ? INT_MAX : nums1[i];
            int Bleft = (j == 0) ? INT_MIN : nums2[j-1];
            int Bright = (j == n) ? INT_MAX : nums2[j];
            if(Aleft <= Bright && Bleft <= Aright) {
                if((m+n) % 2 == 1)
                    return max(Aleft, Bleft);
                return (max(Aleft, Bleft) + min(Aright, Bright)) / 2.0;
            } else if(Aleft > Bright) {
                r = i - 1;
            } else {
                l = i + 1;
            }
        }
        return 0.0;
    }
};`,
        javascript: `var findMedianSortedArrays = function(nums1, nums2) {
    if(nums1.length > nums2.length)
        return findMedianSortedArrays(nums2, nums1);
    let m = nums1.length, n = nums2.length;
    let half = Math.floor((m + n + 1) / 2);
    let l = 0, r = m;
    while(l <= r) {
        let i = Math.floor((l + r) / 2);
        let j = half - i;
        let Aleft = (i === 0) ? -Infinity : nums1[i-1];
        let Aright = (i === m) ? Infinity : nums1[i];
        let Bleft = (j === 0) ? -Infinity : nums2[j-1];
        let Bright = (j === n) ? Infinity : nums2[j];
        if(Aleft <= Bright && Bleft <= Aright) {
            if((m + n) % 2 === 1) {
                return Math.max(Aleft, Bleft);
            }
            return (Math.max(Aleft, Bleft) + Math.min(Aright, Bright)) / 2;
        } else if(Aleft > Bright) {
            r = i - 1;
        } else {
            l = i + 1;
        }
    }
};`
    },
    "Word Search II": {
        python: `def findWords(board, words):
    trie = {}
    for word in words:
        node = trie
        for letter in word:
            node = node.setdefault(letter, {})
        node['#'] = word
    res = set()
    def dfs(i, j, node):
        if '#' in node:
            res.add(node['#'])
        if i < 0 or i >= len(board) or j < 0 or j >= len(board[0]):
            return
        tmp = board[i][j]
        if tmp not in node:
            return
        board[i][j] = None
        for x, y in [(i-1, j), (i+1, j), (i, j-1), (i, j+1)]:
            dfs(x, y, node[tmp])
        board[i][j] = tmp
    for i in range(len(board)):
        for j in range(len(board[0])):
            dfs(i, j, trie)
    return list(res)`,
        cpp: `class Solution {
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        unordered_set<string> result;
        for (string word : words) {
            for (int i = 0; i < board.size(); i++) {
                for (int j = 0; j < board[0].size(); j++) {
                    if (dfs(board, i, j, word, 0))
                        result.insert(word);
                }
            }
        }
        return vector<string>(result.begin(), result.end());
    }
    bool dfs(vector<vector<char>>& board, int i, int j, string word, int index) {
        if(index == word.size())
            return true;
        if(i < 0 || i >= board.size() || j < 0 || j >= board[0].size() || board[i][j] != word[index])
            return false;
        char temp = board[i][j];
        board[i][j] = '#';
        bool found = dfs(board, i+1, j, word, index+1) ||
                     dfs(board, i-1, j, word, index+1) ||
                     dfs(board, i, j+1, word, index+1) ||
                     dfs(board, i, j-1, word, index+1);
        board[i][j] = temp;
        return found;
    }
};`,
        javascript: `var findWords = function(board, words) {
    const result = new Set();
    const trie = {};
    for (let word of words) {
        let node = trie;
        for (let letter of word) {
            if (!node[letter]) node[letter] = {};
            node = node[letter];
        }
        node.word = word;
    }
    const dfs = (i, j, node) => {
        if (node.word) result.add(node.word);
        if (i < 0 || j < 0 || i >= board.length || j >= board[0].length) return;
        const tmp = board[i][j];
        if (!node[tmp]) return;
        board[i][j] = '#';
        dfs(i+1, j, node[tmp]);
        dfs(i-1, j, node[tmp]);
        dfs(i, j+1, node[tmp]);
        dfs(i, j-1, node[tmp]);
        board[i][j] = tmp;
    };
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            dfs(i, j, trie);
        }
    }
    return Array.from(result);
};`
    },
    "Valid Parentheses": {
        python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
        cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if(c == '(' || c == '{' || c == '[')
                st.push(c);
            else {
                if(st.empty()) return false;
                char top = st.top();
                st.pop();
                if(c == ')' && top != '(') return false;
                if(c == '}' && top != '{') return false;
                if(c == ']' && top != '[') return false;
            }
        }
        return st.empty();
    }
};`,
        javascript: `var isValid = function(s) {
    const stack = [];
    const mapping = {')': '(', '}': '{', ']': '['};
    for (let char of s) {
        if (mapping[char]) {
            if (stack.length === 0 || stack.pop() !== mapping[char])
                return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
};`
    },
    "Palindrome Number": {
        python: `def isPalindrome(x: int) -> bool:
    if x < 0:
        return False
    return str(x) == str(x)[::-1]`,
        cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        if(x < 0) return false;
        string s = to_string(x);
        int i = 0, j = s.size() - 1;
        while(i < j){
            if(s[i++] != s[j--])
                return false;
        }
        return true;
    }
};`,
        javascript: `var isPalindrome = function(x) {
    if(x < 0) return false;
    const s = x.toString();
    return s === s.split('').reverse().join('');
};`
    },
    "Container With Most Water": {
        python: `def maxArea(height: list) -> int:
    left, right = 0, len(height) - 1
    max_area = 0
    while left < right:
        max_area = max(max_area, min(height[left], height[right]) * (right - left))
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_area`,
        cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int max_area = 0;
        while(left < right) {
            max_area = max(max_area, min(height[left], height[right]) * (right - left));
            if(height[left] < height[right])
                left++;
            else
                right--;
        }
        return max_area;
    }
};`,
        javascript: `var maxArea = function(height) {
    let left = 0, right = height.length - 1, maxArea = 0;
    while(left < right) {
        maxArea = Math.max(maxArea, Math.min(height[left], height[right]) * (right - left));
        if(height[left] < height[right])
            left++;
        else
            right--;
    }
    return maxArea;
};`
    },
    "Trapping Rain Water": {
        python: `def trap(height: list) -> int:
    if not height: return 0
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    return water`,
        cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int left_max = 0, right_max = 0, water = 0;
        while(left < right) {
            if(height[left] < height[right]) {
                left_max = max(left_max, height[left]);
                water += left_max - height[left];
                left++;
            } else {
                right_max = max(right_max, height[right]);
                water += right_max - height[right];
                right--;
            }
        }
        return water;
    }
};`,
        javascript: `var trap = function(height) {
    let left = 0, right = height.length - 1;
    let left_max = 0, right_max = 0, water = 0;
    while(left < right) {
        if(height[left] < height[right]) {
            left_max = Math.max(left_max, height[left]);
            water += left_max - height[left];
            left++;
        } else {
            right_max = Math.max(right_max, height[right]);
            water += right_max - height[right];
            right--;
        }
    }
    return water;
};`
    },
    "First Missing Positive": {
        python: `def firstMissingPositive(nums: list) -> int:
    n = len(nums)
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i]-1] != nums[i]:
            nums[nums[i]-1], nums[i] = nums[i], nums[nums[i]-1]
    for i in range(n):
        if nums[i] != i+1:
            return i+1
    return n+1`,
        cpp: `class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for(int i = 0; i < n; i++){
            while(nums[i] > 0 && nums[i] <= n && nums[nums[i]-1] != nums[i])
                swap(nums[i], nums[nums[i]-1]);
        }
        for(int i = 0; i < n; i++){
            if(nums[i] != i+1)
                return i+1;
        }
        return n+1;
    }
};`,
        javascript: `var firstMissingPositive = function(nums) {
    const n = nums.length;
    for(let i = 0; i < n; i++){
        while(nums[i] > 0 && nums[i] <= n && nums[nums[i]-1] !== nums[i]){
            [nums[i], nums[nums[i]-1]] = [nums[nums[i]-1], nums[i]];
        }
    }
    for(let i = 0; i < n; i++){
        if(nums[i] !== i+1)
            return i+1;
    }
    return n+1;
};`
    }
};

