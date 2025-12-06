# 3Sum Problem - Step by Step Explanation

## Problem Statement

**Given an array of integers, find all unique triplets that sum to zero.**

Example:
```
Input: nums = [-1, 0, 1, 2, -1, -4]
Output: [[-1, -1, 2], [-1, 0, 1]]
```

---

## Approach: Two Pointers Technique

### Step 1: Understand the Goal
- Find 3 numbers: `a + b + c = 0`
- All triplets should be unique
- Can have duplicate values in array, but triplets should be unique

### Step 2: Basic Strategy
1. **Sort the array** (important for two pointers)
2. Fix one number (`nums[i]`)
3. Use two pointers for remaining two numbers
4. Skip duplicates to avoid duplicate triplets

---

## Step-by-Step Algorithm

### Step 1: Sort the Array
```javascript
nums.sort((a, b) => a - b)
// [-4, -1, -1, 0, 1, 2]
```
**Why?** Sorting helps us:
- Use two pointers efficiently
- Skip duplicates easily
- Avoid checking same combinations multiple times

### Step 2: Iterate Through Array (Fix First Number)

```javascript
for (let i = 0; i < nums.length - 2; i++) {
    // Skip duplicates for first number
    if (i > 0 && nums[i] === nums[i-1]) continue;
    
    // Now find two numbers that sum to -nums[i]
    // Because: nums[i] + nums[left] + nums[right] = 0
    // So: nums[left] + nums[right] = -nums[i]
}
```

**Visual:**
```
i=0: nums[i] = -4
     Need: left + right = 4 (because -4 + left + right = 0)
     
i=1: nums[i] = -1
     Need: left + right = 1 (because -1 + left + right = 0)
```

### Step 3: Two Pointers for Remaining Two Numbers

```javascript
let left = i + 1;      // Start from next element
let right = nums.length - 1;  // Start from end

while (left < right) {
    let sum = nums[i] + nums[left] + nums[right];
    
    if (sum === 0) {
        // Found a triplet!
        result.push([nums[i], nums[left], nums[right]]);
        // Move both pointers and skip duplicates
    } else if (sum < 0) {
        left++;  // Need larger sum, move left pointer right
    } else {
        right--; // Need smaller sum, move right pointer left
    }
}
```

---

## Complete Walkthrough Example

### Input: `nums = [-1, 0, 1, 2, -1, -4]`

#### Step 1: Sort
```
[-4, -1, -1, 0, 1, 2]
```

#### Step 2: i = 0, nums[i] = -4
```
Fix: -4
Need: left + right = 4

left = 1 (value: -1), right = 5 (value: 2)
-4 + (-1) + 2 = -3  < 0  → Need larger → left++

left = 2 (value: -1), right = 5 (value: 2)
-4 + (-1) + 2 = -3  < 0  → Need larger → left++

left = 3 (value: 0), right = 5 (value: 2)
-4 + 0 + 2 = -2  < 0  → Need larger → left++

left = 4 (value: 1), right = 5 (value: 2)
-4 + 1 + 2 = -1  < 0  → Need larger → left++

left = 5, right = 5 → Exit while loop
No triplet found for -4
```

#### Step 3: i = 1, nums[i] = -1
```
Fix: -1
Need: left + right = 1

left = 2 (value: -1), right = 5 (value: 2)
-1 + (-1) + 2 = 0  ✅ FOUND TRIPLET!
Result: [[-1, -1, 2]]

Skip duplicate: left = 3 (still -1), skip
left = 4 (value: 0), right = 4 (value: 1)
-1 + 0 + 1 = 0  ✅ FOUND TRIPLET!
Result: [[-1, -1, 2], [-1, 0, 1]]

left = 5, right = 4 → Exit while loop
```

#### Step 4: i = 2, nums[i] = -1
```
Skip because nums[2] === nums[1] (duplicate)
```

#### Step 5: i = 3, nums[i] = 0
```
Fix: 0
Need: left + right = 0

left = 4 (value: 1), right = 5 (value: 2)
0 + 1 + 2 = 3  > 0  → Need smaller → right--
left = 4, right = 4 → Exit
No triplet found
```

**Final Result: `[[-1, -1, 2], [-1, 0, 1]]`**

---

## Complete Code Implementation

### JavaScript Solution

```javascript
function threeSum(nums) {
    const result = [];
    const n = nums.length;
    
    // Step 1: Sort the array
    nums.sort((a, b) => a - b);
    
    // Step 2: Fix first number
    for (let i = 0; i < n - 2; i++) {
        // Skip duplicates for first number
        if (i > 0 && nums[i] === nums[i - 1]) {
            continue;
        }
        
        // Step 3: Two pointers for remaining two numbers
        let left = i + 1;
        let right = n - 1;
        const target = -nums[i]; // We need: left + right = target
        
        while (left < right) {
            const sum = nums[left] + nums[right];
            
            if (sum === target) {
                // Found a triplet!
                result.push([nums[i], nums[left], nums[right]]);
                
                // Skip duplicates for left pointer
                while (left < right && nums[left] === nums[left + 1]) {
                    left++;
                }
                // Skip duplicates for right pointer
                while (left < right && nums[right] === nums[right - 1]) {
                    right--;
                }
                
                // Move both pointers
                left++;
                right--;
            } else if (sum < target) {
                // Need larger sum, move left pointer right
                left++;
            } else {
                // Need smaller sum, move right pointer left
                right--;
            }
        }
    }
    
    return result;
}
```

### Python Solution

```python
def threeSum(nums):
    result = []
    nums.sort()
    n = len(nums)
    
    for i in range(n - 2):
        # Skip duplicates for first number
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        
        left = i + 1
        right = n - 1
        target = -nums[i]
        
        while left < right:
            current_sum = nums[left] + nums[right]
            
            if current_sum == target:
                result.append([nums[i], nums[left], nums[right]])
                
                # Skip duplicates
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                
                left += 1
                right -= 1
            elif current_sum < target:
                left += 1
            else:
                right -= 1
    
    return result
```

---

## Key Points to Remember

### 1. Why Sort?
- Enables two-pointer technique
- Makes duplicate skipping easy
- Reduces search space

### 2. Why Skip Duplicates?
- To avoid duplicate triplets in result
- Example: `[-1, -1, 0, 1]` should give only one `[-1, 0, 1]`

### 3. Why Two Pointers Work?
```
For sorted array: [-4, -1, -1, 0, 1, 2]

If sum < target: Need larger → Move left pointer right (larger values)
If sum > target: Need smaller → Move right pointer left (smaller values)
If sum == target: Found! Move both and continue
```

### 4. Why `i < n - 2`?
- We need at least 3 elements (i, left, right)
- `left = i + 1` and `right = n - 1`
- So `i` can go maximum to `n - 3` (but loop condition is `i < n - 2`)

---

## Time & Space Complexity

### Time Complexity: **O(n²)**
- Sorting: O(n log n)
- Outer loop: O(n)
- Inner two pointers: O(n)
- Total: O(n log n) + O(n²) = **O(n²)**

### Space Complexity: **O(1)** (excluding output)
- Only using variables (i, left, right)
- Result array is required output

---

## Visual Diagram

```
Sorted Array: [-4, -1, -1, 0, 1, 2]
              i=0   i=1  L   R      

Step 1: Fix i=0 (value: -4)
        Need: L + R = 4
        
        L at -1, R at 2: -1 + 2 = 1 < 4 → L++
        L at -1, R at 2: -1 + 2 = 1 < 4 → L++
        L at 0, R at 2: 0 + 2 = 2 < 4 → L++
        L at 1, R at 2: 1 + 2 = 3 < 4 → L++
        L = R → Stop, no triplet

Step 2: Fix i=1 (value: -1)
        Need: L + R = 1
        
        L at -1, R at 2: -1 + 2 = 1 ✅ FOUND!
        Add [-1, -1, 2]
        
        Skip duplicate -1
        L at 0, R at 1: 0 + 1 = 1 ✅ FOUND!
        Add [-1, 0, 1]
```

---

## Practice Problems

1. **3Sum Closest** - Find triplet with sum closest to target
2. **4Sum** - Find quadruplets that sum to target
3. **3Sum Smaller** - Count triplets with sum < target

---

## Common Mistakes to Avoid

1. ❌ Not sorting the array
2. ❌ Not skipping duplicates
3. ❌ Using same element twice
4. ❌ Not handling edge cases (less than 3 elements)
5. ❌ Using brute force O(n³) approach

---

## Edge Cases

```javascript
// Empty array
threeSum([]) // → []

// Less than 3 elements
threeSum([1, 2]) // → []

// All zeros
threeSum([0, 0, 0]) // → [[0, 0, 0]]

// No solution
threeSum([1, 2, 3]) // → []

// All same numbers (positive)
threeSum([1, 1, 1]) // → []
```

---

## Summary

**3Sum Algorithm Steps:**
1. ✅ Sort the array
2. ✅ Fix first number (i)
3. ✅ Skip duplicates for first number
4. ✅ Use two pointers (left, right) for remaining
5. ✅ If sum = 0: Add to result, skip duplicates, move both
6. ✅ If sum < 0: Move left pointer right
7. ✅ If sum > 0: Move right pointer left

**Key Insight:** Convert 3Sum to 2Sum problem by fixing one number!

