/**
 * DSA Interview Problems - Solutions with Logic Explanation
 * Problems 9-15 from Interview Preparation Guide
 */

// ============================================================================
// 9. 3Sum
// ============================================================================
/**
 * Logic:
 * - Array mein teen numbers find karo jinka sum zero ho
 * - Approach: Sort karo, phir ek number fix karo, baaki do ko two-pointer se find karo
 * - Time: O(n²), Space: O(1) excluding result array
 */
function threeSum(nums) {
    const result = [];
    nums.sort((a, b) => a - b); // Sort karo ascending order mein
    
    for (let i = 0; i < nums.length - 2; i++) {
        // Duplicate skip karo same first number ke liye
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        let left = i + 1;
        let right = nums.length - 1;
        
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                
                // Duplicates skip karo
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < 0) {
                left++; // Sum ko badhana hai
            } else {
                right--; // Sum ko kam karna hai
            }
        }
    }
    
    return result;
}

// Test
console.log("9. 3Sum:", threeSum([-1, 0, 1, 2, -1, -4]));
// Output: [[-1, -1, 2], [-1, 0, 1]]


// ============================================================================
// 10. Container With Most Water
// ============================================================================
/**
 * Logic:
 * - Two lines ke beech maximum water container find karo
 * - Water = min(height[left], height[right]) * (right - left)
 * - Approach: Two pointers - start aur end se, jo chhota hai usko move karo
 * - Time: O(n), Space: O(1)
 */
function maxArea(height) {
    let left = 0;
    let right = height.length - 1;
    let maxWater = 0;
    
    while (left < right) {
        // Current container ka area calculate karo
        const width = right - left;
        const currentArea = Math.min(height[left], height[right]) * width;
        maxWater = Math.max(maxWater, currentArea);
        
        // Jo pointer chhota height par hai, usko move karo
        // Kyonki chhota height hi limit kar raha hai, toh usko badhane se fayda ho sakta hai
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return maxWater;
}

// Test
console.log("10. Container With Most Water:", maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));
// Output: 49


// ============================================================================
// 11. Trapping Rain Water
// ============================================================================
/**
 * Logic:
 * - Bars ke beech kitna pani trap ho sakta hai calculate karo
 * - Approach 1: Two pointers - left aur right se max height track karo
 * - Water trapped = min(maxLeft, maxRight) - currentHeight
 * - Time: O(n), Space: O(1)
 */
function trap(height) {
    if (height.length === 0) return 0;
    
    let left = 0;
    let right = height.length - 1;
    let leftMax = 0;
    let rightMax = 0;
    let water = 0;
    
    while (left < right) {
        if (height[left] < height[right]) {
            // Left side process karo
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            // Right side process karo
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }
    
    return water;
}

// Test
console.log("11. Trapping Rain Water:", trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]));
// Output: 6


// ============================================================================
// 12. Rotate Array
// ============================================================================
/**
 * Logic:
 * - Array ko k positions se right rotate karo
 * - Approach 1: Reverse method - pehle pura reverse, phir first k reverse, phir baaki reverse
 * - Approach 2: Extra space use karke
 * - Time: O(n), Space: O(1) for reverse method
 */
function rotate(nums, k) {
    k = k % nums.length; // Agar k > array length hai toh modulo use karo
    
    // Helper function: array ko reverse karo
    const reverse = (arr, start, end) => {
        while (start < end) {
            [arr[start], arr[end]] = [arr[end], arr[start]];
            start++;
            end--;
        }
    };
    
    // Step 1: Pura array reverse karo
    reverse(nums, 0, nums.length - 1);
    
    // Step 2: First k elements reverse karo
    reverse(nums, 0, k - 1);
    
    // Step 3: Baaki elements reverse karo
    reverse(nums, k, nums.length - 1);
    
    return nums;
}

// Alternative approach with extra space (easier to understand)
function rotateWithExtraSpace(nums, k) {
    k = k % nums.length;
    const n = nums.length;
    const rotated = new Array(n);
    
    for (let i = 0; i < n; i++) {
        rotated[(i + k) % n] = nums[i];
    }
    
    // Copy back to original array
    for (let i = 0; i < n; i++) {
        nums[i] = rotated[i];
    }
    
    return nums;
}

// Test
const arr1 = [1, 2, 3, 4, 5, 6, 7];
console.log("12. Rotate Array:", rotate([...arr1], 3));
// Output: [5, 6, 7, 1, 2, 3, 4]


// ============================================================================
// 13. Valid Anagram
// ============================================================================
/**
 * Logic:
 * - Check karo ki do strings anagram hain ya nahi (same characters, different order)
 * - Approach 1: Sort karke compare karo
 * - Approach 2: Character frequency count karo (better for large strings)
 * - Time: O(n log n) for sort, O(n) for frequency, Space: O(1) or O(n)
 */
function isAnagram(s, t) {
    // Length check - agar different hai toh anagram nahi
    if (s.length !== t.length) return false;
    
    // Approach 1: Sort and compare
    // return s.split('').sort().join('') === t.split('').sort().join('');
    
    // Approach 2: Character frequency (better)
    const charCount = {};
    
    // First string ke characters count karo
    for (let char of s) {
        charCount[char] = (charCount[char] || 0) + 1;
    }
    
    // Second string ke characters subtract karo
    for (let char of t) {
        if (!charCount[char]) {
            return false; // Character exist nahi karta
        }
        charCount[char]--;
    }
    
    // Sab characters zero hone chahiye
    return Object.values(charCount).every(count => count === 0);
}

// Test
console.log("13. Valid Anagram:", isAnagram("anagram", "nagaram")); // true
console.log("13. Valid Anagram:", isAnagram("rat", "car")); // false


// ============================================================================
// 14. Valid Palindrome
// ============================================================================
/**
 * Logic:
 * - Check karo ki string palindrome hai ya nahi (same forwards aur backwards)
 * - Only alphanumeric characters consider karo, case ignore karo
 * - Approach: Two pointers - start aur end se compare karo
 * - Time: O(n), Space: O(1)
 */
function isPalindrome(s) {
    // Helper: check if character is alphanumeric
    const isAlphanumeric = (char) => {
        return (char >= 'a' && char <= 'z') || 
               (char >= 'A' && char <= 'Z') || 
               (char >= '0' && char <= '9');
    };
    
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        // Non-alphanumeric characters skip karo
        while (left < right && !isAlphanumeric(s[left])) {
            left++;
        }
        while (left < right && !isAlphanumeric(s[right])) {
            right--;
        }
        
        // Compare karo (case insensitive)
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
}

// Test
console.log("14. Valid Palindrome:", isPalindrome("A man, a plan, a canal: Panama")); // true
console.log("14. Valid Palindrome:", isPalindrome("race a car")); // false


// ============================================================================
// 15. Longest Common Prefix
// ============================================================================
/**
 * Logic:
 * - Array of strings mein sabse common prefix find karo
 * - Approach 1: Pehli string ko base banao, baaki strings se compare karo
 * - Approach 2: Sort karo, phir first aur last string compare karo
 * - Time: O(n*m) where n = strings count, m = average length
 */
function longestCommonPrefix(strs) {
    if (strs.length === 0) return "";
    if (strs.length === 1) return strs[0];
    
    // Approach 1: Pehli string ko base banao
    let prefix = strs[0];
    
    for (let i = 1; i < strs.length; i++) {
        // Current string se match karte raho jab tak match nahi hota
        while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.substring(0, prefix.length - 1);
            
            // Agar prefix empty ho gaya, toh koi common prefix nahi
            if (prefix === "") return "";
        }
    }
    
    return prefix;
}

// Alternative approach: Character by character comparison
function longestCommonPrefixAlt(strs) {
    if (strs.length === 0) return "";
    
    // Sabse chhoti string ki length find karo
    const minLength = Math.min(...strs.map(s => s.length));
    let prefix = "";
    
    // Har position par check karo
    for (let i = 0; i < minLength; i++) {
        const char = strs[0][i];
        
        // Check karo ki sab strings mein same character hai
        if (strs.every(s => s[i] === char)) {
            prefix += char;
        } else {
            break; // Agar koi mismatch mila, break karo
        }
    }
    
    return prefix;
}

// Test
console.log("15. Longest Common Prefix:", longestCommonPrefix(["flower", "flow", "flight"])); // "fl"
console.log("15. Longest Common Prefix:", longestCommonPrefix(["dog", "racecar", "car"])); // ""


// ============================================================================
// Summary & Time Complexity
// ============================================================================
/**
 * Problem          | Time Complexity | Space Complexity | Key Technique
 * ----------------|-----------------|------------------|------------------
 * 9. 3Sum         | O(n²)          | O(1)             | Two Pointers + Sort
 * 10. Container   | O(n)           | O(1)             | Two Pointers
 * 11. Trapping    | O(n)           | O(1)             | Two Pointers
 * 12. Rotate      | O(n)           | O(1)             | Reverse Method
 * 13. Anagram     | O(n)           | O(1)             | Frequency Count
 * 14. Palindrome  | O(n)           | O(1)             | Two Pointers
 * 15. LCP         | O(n*m)         | O(1)             | String Comparison
 */

