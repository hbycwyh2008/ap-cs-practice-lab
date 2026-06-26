# Beta Demo Flow

This document provides a step-by-step guide for demonstrating the AP CS Practice Lab platform during beta testing.

## Demo Scenario

**Goal:** Demonstrate the complete teacher-student workflow for AP CSA practice assignments with anonymized student accounts.

**Duration:** 10-15 minutes

**Audience:** Teachers, administrators, or potential users evaluating the platform

## Prerequisites

- Platform is deployed and accessible
- Demo teacher account is created
- Browser with developer tools (optional, for debugging)

## Demo Flow

### Part 1: Teacher Setup (3-4 minutes)

#### 1. Login as Teacher

**URL:** `https://your-frontend-domain.com`

**Credentials:**
- Demo account: `teacher@example.com` / `password123`
- Or use your created teacher account

**Action:**
1. Navigate to login page
2. Enter credentials
3. Click "Login"

**Expected Result:**
- Redirected to teacher dashboard
- See "My Classes", "Questions", "Create Assignment" options

---

#### 2. Create a Class

**Location:** My Classes page

**Action:**
1. Click "+ New Class"
2. Enter:
   - Class name: "AP CSA Demo Class"
   - School year: "2026-2027"
3. Click "Create"

**Expected Result:**
- New class appears in the list
- Shows "0 students"

---

#### 3. Bulk Create Anonymized Students

**Location:** My Classes → Class card

**Action:**
1. Click "Manage Students" on the newly created class
2. Set student count: 10
3. Click "Bulk Create Students"
4. **Important:** Copy the displayed credentials
   - Student emails: `student-001@class-X.demo`, `student-002@class-X.demo`, etc.
   - Temporary passwords are shown only once
5. Click "Download Student CSV" to save credentials

**Expected Result:**
- 10 anonymized student accounts created
- Class now shows "10 students"
- CSV downloaded with account details (no passwords in CSV)

**Talking Points:**
- No real student emails required
- Perfect for beta testing without collecting PII
- Teachers can distribute credentials via secure channel
- Emphasize privacy-first approach

---

#### 4. Create or Auto-Generate Assignment

**Option A: Manual Assignment**

**Location:** Create Assignment page

**Action:**
1. Navigate to "Create Assignment"
2. Select "Manual Selection"
3. Choose class: "AP CSA Demo Class"
4. Enter title: "Array Practice"
5. Enter description: "Practice with array traversal problems"
6. Select 2-3 questions from the question bank
7. Set due date: 7 days from now
8. Click "Create Assignment"

**Option B: Auto-Generate Assignment (Recommended for Demo)**

**Location:** Create Assignment page

**Action:**
1. Navigate to "Create Assignment"
2. Select "Auto-Generate"
3. Choose class: "AP CSA Demo Class"
4. Enter title: "Mixed Skills Practice"
5. Select skills:
   - ✓ Arrays
   - ✓ Loops
6. Set question count: 2
7. Set difficulty: Medium
8. Set due date: 7 days from now
9. Click "Generate Assignment"

**Expected Result:**
- Assignment created with selected questions
- Questions match the specified criteria
- Assignment appears in teacher dashboard

**Talking Points:**
- Auto-generation saves time for teachers
- Questions are tagged by skill, difficulty, and topic
- Teacher can still review and modify questions

---

### Part 2: Student Experience (3-4 minutes)

#### 5. Login as Student

**Action:**
1. Open a new incognito/private browser window
2. Navigate to `https://your-frontend-domain.com`
3. Login with one of the bulk-created student accounts
   - Email: `student-001@class-X.demo`
   - Password: (from the copied credentials)

**Expected Result:**
- Redirected to student dashboard
- See the created assignment in "My Assignments"

---

#### 6. View Assignment

**Location:** Student dashboard

**Action:**
1. Click on the assignment "Mixed Skills Practice" (or "Array Practice")
2. Review the assignment details:
   - Due date
   - Number of questions
   - Point values

**Expected Result:**
- Assignment details displayed
- List of questions with titles

---

#### 7. Work on a Question

**Location:** Assignment detail page

**Action:**
1. Click on the first question
2. Read the problem prompt
3. Review the starter code
4. Write or paste a solution (demo code available below)

**Demo Java Solution (Array Maximum):**
```java
public class ArrayProblems {
    public static int findMax(int[] arr) {
        if (arr == null || arr.length == 0) {
            return 0;
        }
        int max = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
        return max;
    }
}
```

**Expected Result:**
- Code editor displays starter code
- Student can modify the code

---

#### 8. Run Public Tests

**Location:** Question page

**Action:**
1. Click "Run Public Tests"
2. Wait 2-3 seconds for results

**Expected Result:**
- Test results displayed
- Shows which tests passed/failed
- Shows public test cases only (no expected output visible)
- Partial score displayed (e.g., "4/10 points")

**Talking Points:**
- Students can test their code before final submission
- Public tests give immediate feedback
- Hidden tests prevent gaming the system

---

#### 9. Submit Final Answer

**Location:** Question page

**Action:**
1. Review the code
2. Click "Submit Final Answer"
3. Confirm submission

**Expected Result:**
- Submission confirmed
- Full score displayed (e.g., "10/10 points")
- Cannot resubmit (final submission)

**Talking Points:**
- Final submission runs both public and hidden tests
- Score is immediately calculated
- Matches AP exam auto-grading format

---

### Part 3: Teacher Analytics (3-4 minutes)

#### 10. View Dashboard Analytics

**Action:**
1. Switch back to teacher browser window (or login again)
2. Navigate to "Dashboard"

**Expected Result:**
- See assignment completion stats:
  - Total students in class
  - Students who attempted (any submission)
  - Students who completed (final submission)
  - Attempt rate and completion rate
  - List of students who haven't completed
- See question performance:
  - Submission count per question
  - Average score per question
  - Pass rate per question
- See skill performance:
  - Average score per skill (Arrays, Loops, etc.)
  - Question count per skill

**Talking Points:**
- Real-time visibility into student progress
- Identify struggling students (not completed list)
- Identify difficult questions (low pass rate)
- Data-driven instruction decisions

---

#### 11. Export Data

**Location:** Dashboard page

**Action:**
1. Scroll to assignment completion stats
2. Click "Export CSV"
3. Review the downloaded CSV

**Expected Result:**
- CSV contains:
  - Assignment title
  - Total students
  - Attempted count
  - Completed count
  - Attempt rate
  - Completion rate

**Talking Points:**
- Easy data export for record-keeping
- Can be imported into grade books
- No student emails in CSV (privacy-safe)

---

### Part 4: Privacy & Beta Notice (2 minutes)

#### 12. Show Privacy Notice

**Location:** Beta Notice page

**Action:**
1. Navigate to `/beta-notice` or click "Learn more" link on class management page
2. Review the privacy information displayed

**Expected Result:**
- Clear explanation of:
  - What data is collected
  - What data is NOT collected
  - Anonymized account recommendations
  - Beta trial limitations

**Talking Points:**
- Platform is designed with student privacy in mind
- No real student emails required for beta
- Anonymized accounts are recommended
- Transparent about data collection

---

## Demo Tips

### Before the Demo

- [ ] Test the full flow yourself
- [ ] Prepare demo code snippets
- [ ] Have student credentials ready to copy
- [ ] Clear browser cache/cookies
- [ ] Test on demo network/device

### During the Demo

- **Go Slow:** Allow audience to see each step
- **Explain Why:** Don't just show features, explain benefits
- **Show Errors:** Demonstrate error handling (compilation errors, test failures)
- **Highlight Privacy:** Emphasize anonymized accounts and data minimization
- **Take Questions:** Pause between sections for Q&A

### Common Questions to Prepare For

**Q: Can students reset their passwords?**
- A: Not in beta MVP. Teachers can bulk-create new accounts if needed.

**Q: Can multiple teachers share a class?**
- A: Not currently. Single-teacher per class in beta.

**Q: What happens if Java code runs forever?**
- A: 5-second timeout enforced by the runner. Safe execution environment.

**Q: Can I import questions from other sources?**
- A: Not yet. Teachers can create custom questions or use seed data.

**Q: Is this only for AP CSA?**
- A: Current MVP focuses on AP CSA FRQs. AP CSP is not yet supported.

**Q: Can students work together?**
- A: Platform doesn't prevent it, but each student submits individually.

**Q: How do I handle cheating?**
- A: Hidden tests help prevent gaming. Plagiarism detection is not built-in.

**Q: Will this work on mobile?**
- A: Desktop browser recommended. Mobile is not optimized in beta.

## Post-Demo Follow-Up

### Feedback Collection

Ask participants:
1. Was the flow intuitive?
2. What features are most valuable?
3. What blockers would prevent adoption?
4. What's missing for your use case?
5. Would you use this in your classroom?

### Next Steps

- Provide demo account access for testing
- Share this document for self-guided exploration
- Schedule follow-up for detailed feedback
- Iterate based on feedback before wider beta

## Troubleshooting

### Issue: Student Can't Login

**Solution:**
- Verify credentials were copied correctly
- Check if account was created (teacher can view in CSV)
- Ensure password wasn't modified when copying

### Issue: Java Runner Timeout

**Solution:**
- Check if code has infinite loops
- Verify Docker is running on backend
- Check Java runner logs

### Issue: Tests Don't Run

**Solution:**
- Verify test cases exist for the question
- Check compilation errors in code
- Ensure method signatures match expected format

### Issue: Analytics Show Zero

**Solution:**
- Ensure students have submitted (not just attempted)
- Refresh the page
- Verify assignment is assigned to correct class

## Demo Variations

### Quick Demo (5 minutes)

Focus on:
1. Bulk-create students (30 seconds)
2. Auto-generate assignment (1 minute)
3. Student login and submission (2 minutes)
4. Teacher analytics (1.5 minutes)

### Deep Dive Demo (20 minutes)

Add:
1. Manual question creation
2. Question archive/restore
3. CSV export walkthrough
4. Student CSV download
5. Error handling demonstration
6. Privacy notice detailed review

### Technical Demo (for IT/admins)

Focus on:
1. Deployment requirements
2. Docker Java runner architecture
3. Security configuration
4. Environment variables
5. Database setup
6. Smoke test execution
