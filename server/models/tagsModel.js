import { Schema } from 'mongoose';

const TagsSchema = new Schema ({
	name:{
		type: String,
		required: true,
		unique: true,
	},

	deleted: {
		type: Boolean,
		default: false,
	},
});

export default TagsSchema;

