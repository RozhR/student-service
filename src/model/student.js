import { Schema, model} from 'mongoose';

const studentSchema = new Schema(
    {
        _id: { type: Number, required: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        scores: {
            type: Map,
            of: Number,
            default: {}
        }
    },
    {
        versionKey: false
    }
);

const Student = model('Student', studentSchema, 'college');

export default Student;