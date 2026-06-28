import * as repo from '../repository/studentRepository.js'

export const addStudent = async (student) => repo.createStudent(student);

export const findStudent = async (id) => renameID(await repo.findStudentById(+id));

export const deleteStudent = async (id) => renameID(await repo.deleteStudent(+id));

export const updateStudent = async (id, data) => renameID(await repo.updateStudent(+id, data));

export const addScore = async (id, exam, score) => repo.updateStudent(+id, {[`scores.${exam}`]: score})

export const findStudentsByName = async (name) => (await repo.findStudentsByName(name)).map(renameID);

export const countStudentsByNames = async (names) => {
    names = Array.isArray(names) ? names : [names];
    return repo.countStudentsByNames(names);
}

export const findStudentsByMinScore = async (exam, minScore) => (await repo.findStudentsByMinScore(exam, +minScore)).map(renameID);

function renameID(student) {
    if (student) {
        student.id = student._id;
        delete student._id;
    }
    return student;
}