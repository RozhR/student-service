import express from 'express';
import request from 'supertest';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';

const mockService = {
    addStudent: jest.fn(),
    findStudent: jest.fn(),
    deleteStudent: jest.fn(),
    updateStudent: jest.fn(),
    addScore: jest.fn(),
    findStudentsByName: jest.fn(),
    countStudentsByNames: jest.fn(),
    findStudentsByMinScore: jest.fn()
};

jest.unstable_mockModule('../service/studentService.js', () => mockService);

const studentRoutes = (await import('../routes/studentRoutes.js')).default;

const app = express();
app.use(express.json());
app.use(studentRoutes);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Student Controller', () => {
    describe('POST /student', () => {
        it('returns 204 when student is created', async () => {
            // Arrange
            const student = {id: 1, name: 'John Doe', password: 'secret'};
            mockService.addStudent.mockResolvedValue(true);

            // Act
            const response = await request(app)
                .post('/student')
                .send(student);

            // Assert
            expect(response.status).toBe(204);
            expect(response.text).toBe('');
            expect(mockService.addStudent).toHaveBeenCalledWith(student);
        });

        it('returns 409 when student already exists', async () => {
            // Arrange
            const student = {id: 1, name: 'John Doe', password: 'secret'};
            mockService.addStudent.mockResolvedValue(false);

            // Act
            const response = await request(app)
                .post('/student')
                .send(student);

            // Assert
            expect(response.status).toBe(409);
            expect(mockService.addStudent).toHaveBeenCalledWith(student);
        });

        it('returns 400 and does not call service when add student payload is invalid', async () => {
            // Act
            const response = await request(app)
                .post('/student')
                .send({id: -1, password: 'secret'});

            // Assert
            expect(response.status).toBe(400);
            expect(response.text).toContain('"id" must be a positive number');
            expect(mockService.addStudent).not.toHaveBeenCalled();
        });
    });

    describe('GET /student/:id', () => {
        it('returns student by id', async () => {
            // Arrange
            const student = {id: 1, name: 'John Doe', password: 'secret'};
            mockService.findStudent.mockResolvedValue(student);

            // Act
            const response = await request(app).get('/student/1');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(student);
            expect(mockService.findStudent).toHaveBeenCalledWith('1');
        });

        it('returns 404 when student is not found', async () => {
            // Arrange
            mockService.findStudent.mockResolvedValue(null);

            // Act
            const response = await request(app).get('/student/404');

            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: 'Student with id 404 not found',
                path: '/student/404'
            });
            expect(response.body.timestamp).toBeDefined();
        });
    });

    describe('DELETE /student/:id', () => {
        it('returns deleted student', async () => {
            // Arrange
            const student = {id: 2, name: 'Ann'};
            mockService.deleteStudent.mockResolvedValue(student);

            // Act
            const response = await request(app).delete('/student/2');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(student);
            expect(mockService.deleteStudent).toHaveBeenCalledWith('2');
        });

        it('returns 404 when deleted student is not found', async () => {
            // Arrange
            mockService.deleteStudent.mockResolvedValue(null);

            // Act
            const response = await request(app).delete('/student/404');

            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: 'Student with id 404 not found',
                path: '/student/404'
            });
        });
    });

    describe('PATCH /student/:id', () => {
        it('returns updated student', async () => {
            // Arrange
            const update = {name: 'Jane Doe'};
            const updated = {id: 3, name: 'Jane Doe', password: 'secret'};
            mockService.updateStudent.mockResolvedValue(updated);

            // Act
            const response = await request(app)
                .patch('/student/3')
                .send(update);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(updated);
            expect(mockService.updateStudent).toHaveBeenCalledWith('3', update);
        });

        it('returns 404 when updated student is not found', async () => {
            // Arrange
            mockService.updateStudent.mockResolvedValue(undefined);

            // Act
            const response = await request(app)
                .patch('/student/404')
                .send({name: 'Jane Doe'});

            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: 'Student with id 404 not found',
                path: '/student/404'
            });
        });

        it('returns 400 and does not call service when update payload is invalid', async () => {
            // Act
            const response = await request(app)
                .patch('/student/3')
                .send({name: 123});

            // Assert
            expect(response.status).toBe(400);
            expect(response.text).toContain('"name" must be a string');
            expect(mockService.updateStudent).not.toHaveBeenCalled();
        });
    });

    describe('PATCH /score/student/:id', () => {
        it('returns 204 when score is added', async () => {
            // Arrange
            mockService.addScore.mockResolvedValue({id: 1});

            // Act
            const response = await request(app)
                .patch('/score/student/1')
                .send({examName: 'Math', score: 95});

            // Assert
            expect(response.status).toBe(204);
            expect(response.text).toBe('');
            expect(mockService.addScore).toHaveBeenCalledWith('1', 'Math', 95);
        });

        it('returns 404 when student for score is not found', async () => {
            // Arrange
            mockService.addScore.mockResolvedValue(null);

            // Act
            const response = await request(app)
                .patch('/score/student/404')
                .send({examName: 'Math', score: 95});

            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: 'Student with id 404 not found',
                path: '/score/student/404'
            });
        });

        it('returns 400 and does not call service when score payload is invalid', async () => {
            // Act
            const response = await request(app)
                .patch('/score/student/1')
                .send({examName: 'Math', score: 101});

            // Assert
            expect(response.status).toBe(400);
            expect(response.text).toContain('"score" must be less than or equal to 100');
            expect(mockService.addScore).not.toHaveBeenCalled();
        });
    });

    describe('GET collection endpoints', () => {
        it('returns students by name', async () => {
            // Arrange
            const students = [{id: 1, name: 'Eva'}];
            mockService.findStudentsByName.mockResolvedValue(students);

            // Act
            const response = await request(app).get('/students/name/Eva');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(students);
            expect(mockService.findStudentsByName).toHaveBeenCalledWith('Eva');
        });

        it('returns count by names query', async () => {
            // Arrange
            mockService.countStudentsByNames.mockResolvedValue(2);

            // Act
            const response = await request(app).get('/quantity/students?names=Ann&names=Bob');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toBe(2);
            expect(mockService.countStudentsByNames).toHaveBeenCalledWith(['Ann', 'Bob']);
        });

        it('returns students by min score', async () => {
            // Arrange
            const students = [{id: 1, scores: {Math: 90}}];
            mockService.findStudentsByMinScore.mockResolvedValue(students);

            // Act
            const response = await request(app).get('/students/exam/Math/minscore/80');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(students);
            expect(mockService.findStudentsByMinScore).toHaveBeenCalledWith('Math', '80');
        });
    });
});
