import {getUserById, saveUser} from './db'

export default class User {
    constructor(userId, firstName, socialCreditScore) {
        this._id = null;
        this.firstName = firstName;
        this.userId = userId;
        this.socialCreditScore = socialCreditScore;
    }

    addCredit(credit) {
        this.socialCreditScore += credit;
    }

    toJSON() {
        return {
            userId: this.userId,
            firstName: this.firstName,
            socialCreditScore: this.socialCreditScore
        };
    }

    static fromJSON(user) {
        let u = new User(user.userId, user.firstName, user.socialCreditScore);
        u._id = user.id;
        return u;
    }

    static async getOrCreateUser(userId, firstName) {
        let existing = await getUserById(userId);
        if (existing) {
            let user = User.fromJSON(existing)
            user._id = existing._id;
            return user;
        } else {
            let user = new User(userId, firstName, 0)
            await saveUser(user)
            return user;
        }
    }
}