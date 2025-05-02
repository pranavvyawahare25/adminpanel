import { 
  User, InsertUser, 
  Student, InsertStudent, 
  Class, InsertClass, 
  Attendance, InsertAttendance, 
  TestResult, InsertTestResult, 
  Installment, InsertInstallment, 
  Event, InsertEvent,
  TeacherPayment, InsertTeacherPayment,
  PublicationNote, InsertPublicationNote,
  StudentNote, InsertStudentNote
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { Store } from "express-session";
import { SupabaseStorage } from './db/supabase-storage';
import { initSupabase } from './db/supabase';

// Create a memory store for sessions
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  supabase?: any; // Supabase client instance
  
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Student related methods
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  getStudents(): Promise<Student[]>;
  
  // Class related methods
  getClass(id: number): Promise<Class | undefined>;
  getClasses(): Promise<Class[]>;
  getClassesByTeacher(teacherId: number): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  
  // Attendance related methods
  getAttendance(id: number): Promise<Attendance | undefined>;
  getAttendanceByClass(classId: number): Promise<Attendance[]>;
  getAttendanceByStudent(studentId: number): Promise<Attendance[]>;
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, status: string): Promise<Attendance | undefined>;
  
  // Test results related methods
  getTestResult(id: number): Promise<TestResult | undefined>;
  getTestResultsByClass(classId: number): Promise<TestResult[]>;
  getTestResultsByStudent(studentId: number): Promise<TestResult[]>;
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  updateTestResult(id: number, score: number, status: string): Promise<TestResult | undefined>;
  
  // Installment related methods
  getInstallment(id: number): Promise<Installment | undefined>;
  getInstallmentsByStudent(studentId: number): Promise<Installment[]>;
  getInstallmentsByStatus(status: string): Promise<Installment[]>;
  createInstallment(installment: InsertInstallment): Promise<Installment>;
  updateInstallment(id: number, status: string, paymentDate?: Date): Promise<Installment | undefined>;
  
  // Event related methods
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Teacher Payment related methods
  getTeacherPayment(id: number): Promise<TeacherPayment | undefined>;
  getTeacherPaymentsByTeacher(teacherId: number): Promise<TeacherPayment[]>;
  getTeacherPaymentsByMonth(month: string): Promise<TeacherPayment[]>;
  getTeacherPaymentsByStatus(status: string): Promise<TeacherPayment[]>;
  createTeacherPayment(payment: InsertTeacherPayment): Promise<TeacherPayment>;
  updateTeacherPayment(id: number, status: string, paymentDate?: Date): Promise<TeacherPayment | undefined>;
  
  // Publication Notes related methods
  getPublicationNote(id: number): Promise<PublicationNote | undefined>;
  getPublicationNotes(): Promise<PublicationNote[]>;
  getPublicationNotesBySubject(subject: string): Promise<PublicationNote[]>;
  getPublicationNotesByGrade(grade: string): Promise<PublicationNote[]>;
  getLowStockPublicationNotes(): Promise<PublicationNote[]>;
  createPublicationNote(note: InsertPublicationNote): Promise<PublicationNote>;
  updatePublicationNoteStock(id: number, totalStock: number, availableStock: number): Promise<PublicationNote | undefined>;
  
  // Student Notes related methods
  getStudentNote(id: number): Promise<StudentNote | undefined>;
  getStudentNotesByStudent(studentId: number): Promise<StudentNote[]>;
  getStudentNotesByNote(noteId: number): Promise<StudentNote[]>;
  createStudentNote(studentNote: InsertStudentNote): Promise<StudentNote>;
  updateStudentNoteStatus(id: number, isReturned: boolean, returnDate?: Date, condition?: string): Promise<StudentNote | undefined>;
  
  // Session store
  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private classes: Map<number, Class>;
  private attendance: Map<number, Attendance>;
  private testResults: Map<number, TestResult>;
  private installments: Map<number, Installment>;
  private events: Map<number, Event>;
  private teacherPayments: Map<number, TeacherPayment>;
  private publicationNotes: Map<number, PublicationNote>;
  private studentNotes: Map<number, StudentNote>;
  
  currentUserId: number;
  currentStudentId: number;
  currentClassId: number;
  currentAttendanceId: number;
  currentTestResultId: number;
  currentInstallmentId: number;
  currentEventId: number;
  currentTeacherPaymentId: number;
  currentPublicationNoteId: number;
  currentStudentNoteId: number;
  
  // Supabase property - undefined for MemStorage
  supabase?: any = undefined;
  
  sessionStore: Store;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.classes = new Map();
    this.attendance = new Map();
    this.testResults = new Map();
    this.installments = new Map();
    this.events = new Map();
    this.teacherPayments = new Map();
    this.publicationNotes = new Map();
    this.studentNotes = new Map();
    
    this.currentUserId = 1;
    this.currentStudentId = 1;
    this.currentClassId = 1;
    this.currentAttendanceId = 1;
    this.currentTestResultId = 1;
    this.currentInstallmentId = 1;
    this.currentEventId = 1;
    this.currentTeacherPaymentId = 1;
    this.currentPublicationNoteId = 1;
    this.currentStudentNoteId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add sample data
    this.addSampleData();
  }
  
  private async addSampleData() {
    try {
      // Create admin user
      const adminUser = await this.createUser({
        username: "admin",
        password: "$2b$10$2pYXCwANWCW5gF3WZsv1ZOIUbio2emmpJlOHJvSfuW5iXSO.Z2aKe", // "admin123"
        fullName: "Administrator",
        email: "admin@vyawahare.edu",
        role: "admin"
      });
      
      // Create teacher users
      const teacherUser = await this.createUser({
        username: "teacher1",
        password: "$2b$10$2pYXCwANWCW5gF3WZsv1ZOIUbio2emmpJlOHJvSfuW5iXSO.Z2aKe", // "admin123"
        fullName: "Rahul Vyawahare",
        email: "rahul@vyawahare.edu",
        role: "teacher"
      });
      
      const teacherUser2 = await this.createUser({
        username: "teacher2",
        password: "$2b$10$2pYXCwANWCW5gF3WZsv1ZOIUbio2emmpJlOHJvSfuW5iXSO.Z2aKe", // "admin123"
        fullName: "Anjali Deshmukh",
        email: "anjali@vyawahare.edu",
        role: "teacher"
      });
      
      // Create sample classes
      const class8 = await this.createClass({
        name: "Math Class 8th",
        grade: "8th",
        teacherId: teacherUser.id,
        schedule: "Monday, Wednesday, Friday 9:00 AM - 10:30 AM"
      });
      
      const class10 = await this.createClass({
        name: "Science Class 10th",
        grade: "10th",
        teacherId: teacherUser.id,
        schedule: "Tuesday, Thursday 10:30 AM - 12:00 PM"
      });
      
      const class6 = await this.createClass({
        name: "English Class 6th",
        grade: "6th",
        teacherId: teacherUser2.id,
        schedule: "Monday, Wednesday 2:00 PM - 3:30 PM"
      });
      
      const class9 = await this.createClass({
        name: "History Class 9th",
        grade: "9th",
        teacherId: teacherUser2.id,
        schedule: "Tuesday, Friday 1:00 PM - 2:30 PM"
      });
      
      // Create sample students
      const student1User = await this.createUser({
        username: "student1",
        password: "$2b$10$2pYXCwANWCW5gF3WZsv1ZOIUbio2emmpJlOHJvSfuW5iXSO.Z2aKe", // "admin123"
        fullName: "Raj Patel",
        email: "raj@example.com",
        role: "student",
        grade: "8th"
      });
      
      const student1 = await this.createStudent({
        userId: student1User.id,
        parentName: "Suresh Patel",
        phone: "9876543210",
        address: "123 Main Street, Pune",
        dateOfBirth: new Date("2010-05-15").toISOString()
      });
      
      const student2User = await this.createUser({
        username: "student2",
        password: "$2b$10$2pYXCwANWCW5gF3WZsv1ZOIUbio2emmpJlOHJvSfuW5iXSO.Z2aKe", // "admin123"
        fullName: "Priya Sharma",
        email: "priya@example.com",
        role: "student",
        grade: "10th"
      });
      
      const student2 = await this.createStudent({
        userId: student2User.id,
        parentName: "Anita Sharma",
        phone: "9876543211",
        address: "456 Park Avenue, Pune",
        dateOfBirth: new Date("2008-07-20").toISOString()
      });
      
      // Add more students for 6th grade
      const student3User = await this.createUser({
        username: "student3",
        password: "$2b$10$2pYXCwANWCW5gF3WZsv1ZOIUbio2emmpJlOHJvSfuW5iXSO.Z2aKe", // "admin123"
        fullName: "Amit Kumar",
        email: "amit@example.com",
        role: "student",
        grade: "6th"
      });
      
      const student3 = await this.createStudent({
        userId: student3User.id,
        parentName: "Rakesh Kumar",
        phone: "9876543212",
        address: "789 Gandhi Road, Pune",
        dateOfBirth: new Date("2012-03-10").toISOString()
      });
      
      // Add more students for 9th grade
      const student4User = await this.createUser({
        username: "student4",
        password: "$2b$10$2pYXCwANWCW5gF3WZsv1ZOIUbio2emmpJlOHJvSfuW5iXSO.Z2aKe", // "admin123"
        fullName: "Sneha Joshi",
        email: "sneha@example.com",
        role: "student",
        grade: "9th"
      });
      
      const student4 = await this.createStudent({
        userId: student4User.id,
        parentName: "Mahesh Joshi",
        phone: "9876543213",
        address: "321 Nehru Road, Pune",
        dateOfBirth: new Date("2009-11-25").toISOString()
      });
      
      // Create sample attendance records
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      await this.createAttendance({
        studentId: student1User.id,
        classId: class8.id,
        date: yesterday.toISOString(),
        status: "present"
      });
      
      await this.createAttendance({
        studentId: student1User.id,
        classId: class8.id,
        date: lastWeek.toISOString(),
        status: "absent"
      });
      
      await this.createAttendance({
        studentId: student2User.id,
        classId: class10.id,
        date: yesterday.toISOString(),
        status: "present"
      });
      
      // Add attendance records for student3 (6th grade)
      await this.createAttendance({
        studentId: student3User.id,
        classId: class6.id,
        date: yesterday.toISOString(),
        status: "present"
      });
      
      await this.createAttendance({
        studentId: student3User.id,
        classId: class6.id,
        date: lastWeek.toISOString(),
        status: "present"
      });
      
      // Add attendance records for student4 (9th grade)
      await this.createAttendance({
        studentId: student4User.id,
        classId: class9.id,
        date: yesterday.toISOString(),
        status: "absent"
      });
      
      await this.createAttendance({
        studentId: student4User.id,
        classId: class9.id,
        date: lastWeek.toISOString(),
        status: "present"
      });
      
      // Create sample test results
      await this.createTestResult({
        name: "Midterm Math Exam",
        studentId: student1User.id,
        classId: class8.id,
        date: lastWeek.toISOString(),
        score: 85,
        maxScore: 100,
        status: "graded"
      });
      
      await this.createTestResult({
        name: "Science Quiz",
        studentId: student2User.id,
        classId: class10.id,
        date: yesterday.toISOString(),
        score: 75,
        maxScore: 100,
        status: "graded"
      });
      
      // Add test results for student3 (6th grade)
      await this.createTestResult({
        name: "English Grammar Test",
        studentId: student3User.id,
        classId: class6.id,
        date: lastWeek.toISOString(),
        score: 82,
        maxScore: 100,
        status: "graded"
      });
      
      await this.createTestResult({
        name: "English Vocabulary Quiz",
        studentId: student3User.id,
        classId: class6.id,
        date: new Date().toISOString(),
        score: 95,
        maxScore: 100,
        status: "graded"
      });
      
      // Add test results for student4 (9th grade)
      await this.createTestResult({
        name: "History Mid-term Exam",
        studentId: student4User.id,
        classId: class9.id,
        date: lastWeek.toISOString(),
        score: 68,
        maxScore: 100,
        status: "graded"
      });
      
      await this.createTestResult({
        name: "Indian Freedom Fighters Quiz",
        studentId: student4User.id,
        classId: class9.id,
        date: yesterday.toISOString(),
        score: 0,
        maxScore: 100,
        status: "pending"
      });
      
      // Create sample installments
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      await this.createInstallment({
        studentId: student1User.id,
        amount: 5000,
        dueDate: lastMonth.toISOString(),
        paymentDate: lastMonth.toISOString(),
        status: "paid"
      });
      
      await this.createInstallment({
        studentId: student1User.id,
        amount: 5000,
        dueDate: new Date().toISOString(),
        status: "pending"
      });
      
      await this.createInstallment({
        studentId: student1User.id,
        amount: 5000,
        dueDate: nextMonth.toISOString(),
        status: "pending"
      });
      
      await this.createInstallment({
        studentId: student2User.id,
        amount: 6000,
        dueDate: lastMonth.toISOString(),
        status: "overdue"
      });
      
      await this.createInstallment({
        studentId: student2User.id,
        amount: 6000,
        dueDate: nextMonth.toISOString(),
        status: "pending"
      });
      
      // Add installments for student3 (6th grade)
      await this.createInstallment({
        studentId: student3User.id,
        amount: 4500,
        dueDate: lastMonth.toISOString(),
        paymentDate: lastMonth.toISOString(),
        status: "paid"
      });
      
      await this.createInstallment({
        studentId: student3User.id,
        amount: 4500,
        dueDate: new Date().toISOString(),
        paymentDate: new Date().toISOString(),
        status: "paid"
      });
      
      await this.createInstallment({
        studentId: student3User.id,
        amount: 4500,
        dueDate: nextMonth.toISOString(),
        status: "pending"
      });
      
      // Add installments for student4 (9th grade)
      await this.createInstallment({
        studentId: student4User.id,
        amount: 5500,
        dueDate: lastMonth.toISOString(),
        paymentDate: lastMonth.toISOString(),
        status: "paid"
      });
      
      await this.createInstallment({
        studentId: student4User.id,
        amount: 5500,
        dueDate: new Date().toISOString(),
        status: "overdue"
      });
      
      await this.createInstallment({
        studentId: student4User.id,
        amount: 5500,
        dueDate: nextMonth.toISOString(),
        status: "pending"
      });
      
      // Create sample events
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      await this.createEvent({
        title: "Parent-Teacher Meeting",
        description: "Annual meeting to discuss student progress",
        date: nextWeek.toISOString(),
        time: "10:00 AM - 2:00 PM",
        targetGrades: "All"
      });
      
      const nextTwoWeeks = new Date();
      nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14);
      
      await this.createEvent({
        title: "Science Fair",
        description: "Annual science exhibition for students",
        date: nextTwoWeeks.toISOString(),
        time: "9:00 AM - 4:00 PM",
        targetGrades: "8th, 9th, 10th"
      });
      
      // Create sample teacher payments
      // For current month (paid)
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Teacher 1 current month payment (paid)
      await this.createTeacherPayment({
        teacherId: teacherUser.id,
        amount: 25000,
        month: currentMonth,
        description: "Monthly salary",
        paymentDate: currentDate.toISOString(),
        status: "paid"
      });
      
      // Teacher 1 next month payment (pending)
      const nextMonthDate = new Date();
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextMonthString = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
      
      await this.createTeacherPayment({
        teacherId: teacherUser.id,
        amount: 25000,
        month: nextMonthString,
        description: "Monthly salary",
        paymentDate: new Date().toISOString(), // Add payment date to fix type error
        status: "pending"
      });
      
      // Teacher 1 last month payment (paid)
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonthString = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
      
      await this.createTeacherPayment({
        teacherId: teacherUser.id,
        amount: 25000,
        month: lastMonthString,
        description: "Monthly salary",
        paymentDate: lastMonthDate.toISOString(),
        status: "paid"
      });
      
      // Teacher 2 current month payment (pending)
      await this.createTeacherPayment({
        teacherId: teacherUser2.id,
        amount: 22000,
        month: currentMonth,
        description: "Monthly salary",
        paymentDate: new Date().toISOString(), // Add payment date to fix type error
        status: "pending"
      });
      
      // Teacher 2 last month payment (paid)
      await this.createTeacherPayment({
        teacherId: teacherUser2.id,
        amount: 22000,
        month: lastMonthString,
        description: "Monthly salary",
        paymentDate: lastMonthDate.toISOString(),
        status: "paid"
      });
    } catch (error) {
      console.error("Failed to add sample data:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const joinDate = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      joinDate,
      role: insertUser.role || "student", 
      grade: insertUser.grade || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Student methods
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.userId === userId,
    );
  }
  
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = { 
      ...insertStudent, 
      id,
      parentName: insertStudent.parentName || null,
      phone: insertStudent.phone || null,
      address: insertStudent.address || null,
      dateOfBirth: insertStudent.dateOfBirth || null
    };
    this.students.set(id, student);
    return student;
  }
  
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  // Class methods
  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }
  
  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }
  
  async getClassesByTeacher(teacherId: number): Promise<Class[]> {
    return Array.from(this.classes.values()).filter(
      (cls) => cls.teacherId === teacherId,
    );
  }
  
  async createClass(insertClass: InsertClass): Promise<Class> {
    const id = this.currentClassId++;
    const cls: Class = { 
      ...insertClass, 
      id,
      schedule: insertClass.schedule || null
    };
    this.classes.set(id, cls);
    return cls;
  }

  // Attendance methods
  async getAttendance(id: number): Promise<Attendance | undefined> {
    return this.attendance.get(id);
  }
  
  async getAttendanceByClass(classId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      (attendance) => attendance.classId === classId,
    );
  }
  
  async getAttendanceByStudent(studentId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      (attendance) => attendance.studentId === studentId,
    );
  }
  
  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.attendance.values()).filter(
      (attendance) => {
        const attendanceDate = new Date(attendance.date).toISOString().split('T')[0];
        return attendanceDate === dateString;
      }
    );
  }
  
  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = this.currentAttendanceId++;
    const attendance: Attendance = { 
      ...insertAttendance, 
      id, 
      status: insertAttendance.status || "present" 
    };
    this.attendance.set(id, attendance);
    return attendance;
  }
  
  async updateAttendance(id: number, status: string): Promise<Attendance | undefined> {
    const attendance = this.attendance.get(id);
    if (!attendance) return undefined;
    
    const updatedAttendance = { 
      ...attendance, 
      status: status as "present" | "absent" | "late"
    };
    this.attendance.set(id, updatedAttendance);
    return updatedAttendance;
  }

  // Test results methods
  async getTestResult(id: number): Promise<TestResult | undefined> {
    return this.testResults.get(id);
  }
  
  async getTestResultsByClass(classId: number): Promise<TestResult[]> {
    return Array.from(this.testResults.values()).filter(
      (result) => result.classId === classId,
    );
  }
  
  async getTestResultsByStudent(studentId: number): Promise<TestResult[]> {
    return Array.from(this.testResults.values()).filter(
      (result) => result.studentId === studentId,
    );
  }
  
  async createTestResult(insertResult: InsertTestResult): Promise<TestResult> {
    const id = this.currentTestResultId++;
    const result: TestResult = { 
      ...insertResult, 
      id, 
      maxScore: insertResult.maxScore || 100, // Ensure maxScore has a value, defaulting to 100
      status: insertResult.status || "pending" 
    };
    this.testResults.set(id, result);
    return result;
  }
  
  async updateTestResult(id: number, score: number, status: string): Promise<TestResult | undefined> {
    const result = this.testResults.get(id);
    if (!result) return undefined;
    
    const updatedResult = { 
      ...result, 
      score,
      status: status as "pending" | "graded"
    };
    this.testResults.set(id, updatedResult);
    return updatedResult;
  }

  // Installment methods
  async getInstallment(id: number): Promise<Installment | undefined> {
    return this.installments.get(id);
  }
  
  async getInstallmentsByStudent(studentId: number): Promise<Installment[]> {
    return Array.from(this.installments.values()).filter(
      (installment) => installment.studentId === studentId,
    );
  }
  
  async getInstallmentsByStatus(status: string): Promise<Installment[]> {
    return Array.from(this.installments.values()).filter(
      (installment) => installment.status === status,
    );
  }
  
  async createInstallment(insertInstallment: InsertInstallment): Promise<Installment> {
    const id = this.currentInstallmentId++;
    const installment: Installment = { 
      ...insertInstallment, 
      id, 
      paymentDate: insertInstallment.paymentDate || null,
      status: insertInstallment.status || "pending" 
    };
    this.installments.set(id, installment);
    return installment;
  }
  
  async updateInstallment(id: number, status: string, paymentDate?: Date): Promise<Installment | undefined> {
    const installment = this.installments.get(id);
    if (!installment) return undefined;
    
    const updatedInstallment = { 
      ...installment, 
      status: status as "paid" | "pending" | "overdue",
      paymentDate: paymentDate?.toISOString() || installment.paymentDate
    };
    this.installments.set(id, updatedInstallment);
    return updatedInstallment;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { 
      ...insertEvent, 
      id, 
      description: insertEvent.description || null,
      time: insertEvent.time || null,
      targetGrades: insertEvent.targetGrades || null
    };
    this.events.set(id, event);
    return event;
  }

  // Teacher Payment methods
  async getTeacherPayment(id: number): Promise<TeacherPayment | undefined> {
    return this.teacherPayments.get(id);
  }
  
  async getTeacherPaymentsByTeacher(teacherId: number): Promise<TeacherPayment[]> {
    return Array.from(this.teacherPayments.values()).filter(
      (payment) => payment.teacherId === teacherId,
    );
  }
  
  async getTeacherPaymentsByMonth(month: string): Promise<TeacherPayment[]> {
    return Array.from(this.teacherPayments.values()).filter(
      (payment) => payment.month === month,
    );
  }
  
  async getTeacherPaymentsByStatus(status: string): Promise<TeacherPayment[]> {
    return Array.from(this.teacherPayments.values()).filter(
      (payment) => payment.status === status,
    );
  }
  
  async createTeacherPayment(insertPayment: InsertTeacherPayment): Promise<TeacherPayment> {
    const id = this.currentTeacherPaymentId++;
    const payment: TeacherPayment = { 
      ...insertPayment, 
      id, 
      description: insertPayment.description || null,
      paymentDate: insertPayment.paymentDate || null,
      status: insertPayment.status || "pending" 
    };
    this.teacherPayments.set(id, payment);
    return payment;
  }
  
  async updateTeacherPayment(id: number, status: string, paymentDate?: Date): Promise<TeacherPayment | undefined> {
    const payment = this.teacherPayments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { 
      ...payment, 
      status: status as "paid" | "pending" | "cancelled",
      paymentDate: paymentDate?.toISOString() || payment.paymentDate
    };
    this.teacherPayments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Publication Notes methods
  async getPublicationNote(id: number): Promise<PublicationNote | undefined> {
    return this.publicationNotes.get(id);
  }

  async getPublicationNotes(): Promise<PublicationNote[]> {
    return Array.from(this.publicationNotes.values());
  }

  async getPublicationNotesBySubject(subject: string): Promise<PublicationNote[]> {
    return Array.from(this.publicationNotes.values()).filter(
      (note) => note.subject === subject
    );
  }

  async getPublicationNotesByGrade(grade: string): Promise<PublicationNote[]> {
    return Array.from(this.publicationNotes.values()).filter(
      (note) => note.grade === grade
    );
  }

  async getLowStockPublicationNotes(): Promise<PublicationNote[]> {
    return Array.from(this.publicationNotes.values()).filter(
      (note) => note.availableStock <= note.lowStockThreshold
    );
  }

  async createPublicationNote(insertNote: InsertPublicationNote): Promise<PublicationNote> {
    const id = this.currentPublicationNoteId++;
    const note: PublicationNote = {
      ...insertNote,
      id,
      totalStock: insertNote.totalStock || 0,
      availableStock: insertNote.availableStock || 0,
      lowStockThreshold: insertNote.lowStockThreshold || 5,
      lastRestocked: insertNote.lastRestocked || new Date().toISOString(),
      description: insertNote.description || null
    };
    this.publicationNotes.set(id, note);
    return note;
  }

  async updatePublicationNoteStock(id: number, totalStock: number, availableStock: number): Promise<PublicationNote | undefined> {
    const note = this.publicationNotes.get(id);
    if (!note) return undefined;

    const updatedNote = {
      ...note,
      totalStock,
      availableStock,
      lastRestocked: new Date().toISOString()
    };

    this.publicationNotes.set(id, updatedNote);
    return updatedNote;
  }

  // Student Notes methods
  async getStudentNote(id: number): Promise<StudentNote | undefined> {
    return this.studentNotes.get(id);
  }

  async getStudentNotesByStudent(studentId: number): Promise<StudentNote[]> {
    return Array.from(this.studentNotes.values()).filter(
      (note) => note.studentId === studentId
    );
  }

  async getStudentNotesByNote(noteId: number): Promise<StudentNote[]> {
    return Array.from(this.studentNotes.values()).filter(
      (note) => note.noteId === noteId
    );
  }

  async createStudentNote(insertStudentNote: InsertStudentNote): Promise<StudentNote> {
    const id = this.currentStudentNoteId++;
    const studentNote: StudentNote = {
      ...insertStudentNote,
      id,
      dateIssued: insertStudentNote.dateIssued || new Date().toISOString(),
      isReturned: insertStudentNote.isReturned || false,
      returnDate: insertStudentNote.returnDate || null,
      condition: (insertStudentNote.condition as "excellent" | "good" | "fair" | "poor" | null) || "good",
      notes: insertStudentNote.notes || null
    };
    this.studentNotes.set(id, studentNote);
    
    // Update available stock in the publication notes
    const note = this.publicationNotes.get(insertStudentNote.noteId);
    if (note && !insertStudentNote.isReturned) {
      const updatedNote = {
        ...note,
        availableStock: Math.max(0, note.availableStock - 1)
      };
      this.publicationNotes.set(note.id, updatedNote);
    }
    
    return studentNote;
  }

  async updateStudentNoteStatus(id: number, isReturned: boolean, returnDate?: Date, condition?: "excellent" | "good" | "fair" | "poor"): Promise<StudentNote | undefined> {
    const studentNote = this.studentNotes.get(id);
    if (!studentNote) return undefined;

    const updatedStudentNote = {
      ...studentNote,
      isReturned,
      returnDate: returnDate ? returnDate.toISOString() : studentNote.returnDate,
      condition: condition || studentNote.condition
    };

    this.studentNotes.set(id, updatedStudentNote);
    
    // Update available stock in the publication notes if note is being returned
    if (isReturned && !studentNote.isReturned) {
      const note = this.publicationNotes.get(studentNote.noteId);
      if (note) {
        const updatedNote = {
          ...note,
          availableStock: Math.min(note.totalStock, note.availableStock + 1)
        };
        this.publicationNotes.set(note.id, updatedNote);
      }
    }
    
    return updatedStudentNote;
  }
}

// Force memory storage for Netlify deployment
const useSupabase = process.env.USE_SUPABASE === 'true';
console.log(`[storage] Using ${useSupabase ? 'Supabase' : 'in-memory'} storage`);

// Always use in-memory storage for now to ensure Netlify compatibility
export const storage = new MemStorage();

// Initialize Supabase connection if we're using it
if (useSupabase) {
  initSupabase()
    .then(connected => {
      if (!connected) {
        console.warn('[supabase] Failed to connect to Supabase, falling back to in-memory storage');
        // Force usage of in-memory storage
        process.env.USE_SUPABASE = 'false';
      }
    })
    .catch(err => {
      console.error('[supabase] Error initializing Supabase:', err);
      // Force usage of in-memory storage
      process.env.USE_SUPABASE = 'false';
    });
}