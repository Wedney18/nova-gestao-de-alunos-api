import request from 'supertest';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { comTokenDeAdmin, comTokenDeAluno } from '../helpers/auth.js';
import Trabalho from '../../src/models/trabalho.model.js';
import trabalhos from '../fixtures/trabalhos.json' with { type: 'json' };
import { api } from '../helpers/api.js';

describe('Trabalhos External', () => {
    for (const caso of trabalhos) {
        it(caso.testTitle, async () => {
            const tokenAluno = await comTokenDeAluno();
            const alunoId = jwt.decode(tokenAluno).sub;

            const tokenAdmin = await comTokenDeAdmin();
            const matriculaResposta = await api()
                .post(`/api/admin/disciplinas/${caso.disciplinaId}/matriculas`)
                .set('Content-Type', 'application/json')
                .set('Authorization', tokenAdmin)
                .send({ alunoId });

            expect(matriculaResposta.status).to.equal(409);

            await Trabalho.deleteMany({
                alunoId,
                disciplinaId: caso.disciplinaId,
                titulo: caso.titulo,
            });

            const resposta = await api()
                .post(`/api/alunos/${alunoId}/trabalhos`)
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAluno}`)
                .send({
                    disciplinaId: caso.disciplinaId,
                    titulo: caso.titulo,
                    descricao: caso.descricao,
                });

            expect(resposta.status).to.equal(caso.statusCodeEsperado);
            expect(resposta.body.alunoId).to.equal(alunoId);
            expect(resposta.body.disciplinaId).to.equal(caso.disciplinaId);
            expect(resposta.body.titulo).to.equal(caso.titulo);
            expect(resposta.body.descricao).to.equal(caso.descricao);
            expect(resposta.body.status).to.equal('entregue');
        });
    }
});