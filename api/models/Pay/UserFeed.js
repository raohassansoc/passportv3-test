let mongoose = require("mongoose");
const Users = require("../Pay/User");
let Schema = mongoose.Schema;

let UsersFeedSchema = new Schema({
    image: {
        type: String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Users,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    deleted_at: {
        type: Date,
        default: null,
    },
    updated_at: {
        type: Date,
        default: Date,
    },
    created_at: {
        type: Date,
        default: Date,
    },
});
UsersFeedSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});
let UserFeed = mongoose.model("users_feed", UsersFeedSchema);
module.exports = UserFeed;
