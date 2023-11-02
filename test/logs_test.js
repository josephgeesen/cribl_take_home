"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const supertest_1 = __importDefault(require("supertest"));
let api = (0, supertest_1.default)('http://localhost:3001');
describe('Log List', () => {
    it('should return a 200', (done) => {
        api.get(`/api/logs`)
            .expect(200)
            .end(done);
    });
});
describe('Log Reader', () => {
    describe('filename', () => {
        it('should return a 200', (done) => {
            api.get(`/api/log/test.log`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 20);
            })
                .expect(200, done);
        });
        it('should return a 404 if the requested file does not exist', (done) => {
            api.get(`/api/log/non_existent_log_name.log`)
                .expect({ status: 404, message: 'non_existent_log_name.log does not exist.' })
                .expect(404, done);
        });
        it('should return a 403 if path traversal is tried', (done) => {
            api.get(`/api/log/..%2Ftest.log`)
                .expect({ status: 403, message: 'Access Denied.' })
                .expect(403, done);
        });
    });
    describe('entries', () => {
        it('should return a 400 if entries is non-numeric', (done) => {
            api.get(`/api/log/test.log?entries=e`)
                .expect({
                status: 400,
                message: `'entries' if specified must be a positive numeric value of at least 1.`
            })
                .expect(400, done);
        });
        it('should return a 400 if entries is 0', (done) => {
            api.get(`/api/log/test.log?entries=0`)
                .expect({
                status: 400,
                message: `'entries' if specified must be a positive numeric value of at least 1.`
            })
                .expect(400, done);
        });
        it('should return a 400 if entries is negative', (done) => {
            api.get(`/api/log/test.log?entries=-1`)
                .expect({
                status: 400,
                message: `'entries' if specified must be a positive numeric value of at least 1.`
            })
                .expect(400, done);
        });
        it('should return 20 entries, if entries is empty', (done) => {
            api.get(`/api/log/test.log?entries=`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 20);
            })
                .expect(200, done);
        });
        it('should return 10 entries, if entries is 10', (done) => {
            api.get(`/api/log/test.log?entries=10`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 10);
            })
                .expect(200, done);
        });
    });
    describe('filter', () => {
        it('should return 10 entries, if filtered by INFO', (done) => {
            api.get(`/api/log/test.log?filter=INFO`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 10);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by [', (done) => {
            api.get(`/api/log/test.log?filter=[`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by ]', (done) => {
            api.get(`/api/log/test.log?filter=]`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by (', (done) => {
            api.get(`/api/log/test.log?filter=(`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by )', (done) => {
            api.get(`/api/log/test.log?filter=)`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by *', (done) => {
            api.get(`/api/log/test.log?filter=*`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by +', (done) => {
            api.get(`/api/log/test.log?filter=%2B`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by |', (done) => {
            api.get(`/api/log/test.log?filter=|`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by ?', (done) => {
            api.get(`/api/log/test.log?filter=?`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by .', (done) => {
            api.get(`/api/log/test.log?filter=.`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by {', (done) => {
            api.get(`/api/log/test.log?filter={`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by }', (done) => {
            api.get(`/api/log/test.log?filter=}`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 10 entries, if filtered by -', (done) => {
            api.get(`/api/log/test.log?filter=-`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 10);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by ^', (done) => {
            api.get(`/api/log/test.log?filter=^`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 5 entries, if filtered by \\', (done) => {
            api.get(`/api/log/test.log?filter=\\`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 5);
            })
                .expect(200, done);
        });
        it('should return 0 entries, if filtered by non-existent value', (done) => {
            api.get(`/api/log/test.log?filter=I_DO_NOT_EXIST`)
                .expect((res) => {
                chai_1.assert.equal(res.body.length, 0);
            })
                .expect(200, done);
        });
    });
});
