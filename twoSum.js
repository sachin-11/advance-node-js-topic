/**
 * Two Sum Implementation in JavaScript
 * Problem: Find two numbers in an array that add up to a specific target.
 */

// Approach 1: Brute Force (Basic Logic)
// Check every pair to see if they match the target.
// Time Complexity: O(N^2)
function twoSumBruteForce(nums, target) {
    console.log("Running Brute Force Approach...");
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j]; // Pair found
            }
        }
    }
    return []; // No pair found
}

// Approach 2: Optimized using Hash Map (Best Logic)
// Use an object/map to store numbers we have seen.
// Time Complexity: O(N)
function twoSumOptimized(nums, target) {
    console.log("Running Optimized Hash Map Approach...");
    const map = {}; // Stores value: index

    for (let i = 0; i < nums.length; i++) {
        const currentNum = nums[i];
        const neededCheck = target - currentNum;

        // Agar needed number map me hai, to answer mil gaya
        if (map.hasOwnProperty(neededCheck)) {
            return [map[neededCheck], i];
        }

        // Current number aur uska index map me save karo
        map[currentNum] = i;
    }
    
    return []; // Agar koi answer nahi mila
}

// --- Example Usage ---
const nums = [2, 7, 11, 15];
const target = 9;

console.log("Input Array:", nums);
console.log("Target:", target);

console.log("Brute Force Result:", twoSumBruteForce(nums, target)); 
// Output: [0, 1]

console.log("Optimized Result:", twoSumOptimized(nums, target)); 
// Output: [0, 1]
