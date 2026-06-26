const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type UserRole = "teacher" | "student";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  class_id: number | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Question {
  id: number;
  title: string;
  course: string;
  unit: string;
  topic: string;
  difficulty: string;
  type: string;
  prompt: string;
  starter_code: string;
  reference_solution: string | null;
  max_points: number;
  skill: string | null;
  estimated_minutes: number;
  source: string | null;
  is_active: boolean;
  created_by: number;
  created_at: string;
}

export interface TestCase {
  id: number;
  question_id: number;
  name: string;
  input_json: string;
  expected_output?: string;
  is_hidden: boolean;
  points: number;
  created_at: string;
}

export interface SchoolClass {
  id: number;
  name: string;
  school_year: string;
  teacher_id: number;
  created_at: string;
  student_count: number;
}

export interface StudentAccountInfo {
  id: number;
  name: string;
  email: string;
  temporary_password: string;
  class_id: number;
}

export interface BulkCreateStudentsResponse {
  created: StudentAccountInfo[];
  count: number;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  class_id: number;
  created_by: number;
  due_at: string | null;
  created_at: string;
}

export interface AssignmentQuestion {
  id: number;
  assignment_id: number;
  question_id: number;
  order: number;
  points: number;
  question?: Question;
}

export interface AssignmentDetail extends Assignment {
  questions: AssignmentQuestion[];
}

export interface TestResult {
  name: string;
  hidden: boolean;
  passed: boolean;
  points: number;
  message: string;
  expected_output?: string;
}

export interface Feedback {
  compiled: boolean;
  total_tests: number;
  passed_tests: number;
  score: number;
  max_score: number;
  tests: TestResult[];
}

export interface Submission {
  id: number;
  student_id: number;
  assignment_id: number;
  question_id: number;
  code: string;
  status: string;
  score: number;
  max_score: number;
  feedback_json: string;
  compile_output: string;
  runtime_output: string;
  is_final: boolean;
  created_at: string;
  student_name?: string;
  question_title?: string;
  feedback?: Feedback;
}

export interface DashboardStats {
  class_count: number;
  question_count: number;
  assignment_count: number;
  recent_submissions: Submission[];
  my_assignments: Assignment[];
  average_score: number | null;
}

export interface StudentLite {
  id: number;
  display_name: string;
}

export interface AssignmentCompletionStats {
  assignment_id: number;
  title: string;
  total_students: number;
  attempted_students: number;
  completed_students: number;
  attempt_rate: number;
  completion_rate: number;
  not_completed_students: StudentLite[];
}

export interface QuestionStats {
  question_id: number;
  title: string;
  unit: string;
  skill: string | null;
  submission_count: number;
  avg_score: number;
  pass_rate: number;
}

export interface SkillStats {
  skill: string;
  avg_score: number;
  question_count: number;
}

export interface TeacherAnalytics {
  assignment_stats: AssignmentCompletionStats[];
  question_stats: QuestionStats[];
  skill_stats: SkillStats[];
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, err.detail || "Request failed");
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<TokenResponse>("/auth/login/json", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me"),

  getDashboard: () => request<DashboardStats>("/dashboard"),

  getAnalytics: () => request<TeacherAnalytics>("/analytics"),

  getClasses: () => request<SchoolClass[]>("/classes"),
  getClass: (id: number) => request<SchoolClass>(`/classes/${id}`),
  createClass: (data: { name: string; school_year: string }) =>
    request<SchoolClass>("/classes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  bulkCreateStudents: (classId: number, data: { count: number; prefix?: string }) =>
    request<BulkCreateStudentsResponse>(`/classes/${classId}/students/bulk-create`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getQuestions: () => request<Question[]>("/questions"),
  getQuestion: (id: number) => request<Question>(`/questions/${id}`),
  createQuestion: (data: Partial<Question>) =>
    request<Question>("/questions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateQuestion: (id: number, data: Partial<Question>) =>
    request<Question>(`/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteQuestion: (id: number) =>
    request(`/questions/${id}`, { method: "DELETE" }),
  archiveQuestion: (id: number) =>
    request(`/questions/${id}`, { method: "DELETE" }),
  restoreQuestion: (id: number) =>
    request(`/questions/${id}/restore`, { method: "POST" }),

  getTestCases: (questionId: number) =>
    request<TestCase[]>(`/questions/${questionId}/test-cases`),
  createTestCase: (questionId: number, data: Partial<TestCase>) =>
    request<TestCase>(`/questions/${questionId}/test-cases`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAssignments: () => request<Assignment[]>("/assignments"),
  getAssignment: (id: number) =>
    request<AssignmentDetail>(`/assignments/${id}`),
  createAssignment: (data: {
    title: string;
    description: string;
    class_id: number;
    due_at?: string;
    questions: { question_id: number; order: number; points: number }[];
  }) =>
    request<AssignmentDetail>("/assignments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  generateAssignment: (data: {
    title: string;
    description: string;
    class_id: number;
    due_at?: string;
    course?: string;
    units?: string[];
    difficulties?: string[];
    skills?: string[];
    question_count: number;
    include_recent_questions?: boolean;
  }) =>
    request<AssignmentDetail>("/assignments/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSubmissions: (params?: Record<string, string | number | boolean>) => {
    const qs = params
      ? "?" + new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return request<Submission[]>(`/submissions${qs}`);
  },

  runCode: (data: {
    question_id: number;
    assignment_id: number;
    code: string;
    public_only?: boolean;
  }) =>
    request<{
      feedback: Feedback;
      score: number;
      max_score: number;
      status: string;
      compile_output: string;
      runtime_output: string;
    }>(
      "/submissions/run",
      { method: "POST", body: JSON.stringify({ ...data, public_only: true }) }
    ),

  submitCode: (data: {
    question_id: number;
    assignment_id: number;
    code: string;
  }) =>
    request<Submission>("/submissions/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export { ApiError };
