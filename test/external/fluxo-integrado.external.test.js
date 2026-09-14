import { expect } from 'chai';
import { comTokenDeAdmin, getToken } from '../helpers/auth.js';
import { api } from '../helpers/api.js';
import Aluno from '../../src/models/aluno.model.js';
import Matricula from '../../src/models/matricula.model.js';
import Trabalho from '../../src/models/trabalho.model.js';
import fluxoCases from '../fixtures/fluxo-integrado.json' with { type: 'json' };

for (const caso of fluxoCases) {
    describe('Fluxo integrado de aluno', () => {
        beforeEach(async () => {
            const aluno = await Aluno.findOne({ email: caso.email });
            if (!aluno) return;

            await Trabalho.deleteMany({ alunoId: aluno._id });
            await Matricula.deleteMany({ alunoId: aluno._id });
            await Aluno.deleteOne({ _id: aluno._id });
        });

        it(caso.testTitle, async () => {
            const tokenAdmin = await comTokenDeAdmin();
            const cadastroResposta = await api()
                .post('/api/admin/alunos')
                .set('Content-Type', 'application/json')
                .set('Authorization', tokenAdmin)
                .send({
                    nome: caso.nome,
                    email: caso.email,
                    matricula: caso.matricula,
                    senha: caso.senha,
                });

            expect(cadastroResposta.status).to.equal(caso.cadastroStatusEsperado);
            const alunoId = cadastroResposta.body.id;

            const loginResposta = await api()
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send({ email: caso.email, senha: caso.senha });

            expect(loginResposta.status).to.equal(caso.loginStatusEsperado);
            const tokenAluno = await getToken(caso.email, caso.senha);

            const matriculaResposta = await api()
                .post(`/api/admin/disciplinas/${caso.disciplinaId}/matriculas`)
                .set('Content-Type', 'application/json')
                .set('Authorization', tokenAdmin)
                .send({ alunoId });

            expect(matriculaResposta.status).to.equal(caso.matriculaStatusEsperado);

            const entregaResposta = await api()
                .post(`/api/alunos/${alunoId}/trabalhos`)
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAluno}`)
                .send({
                    disciplinaId: caso.disciplinaId,
                    titulo: caso.titulo,
                    descricao: caso.descricao,
                });

            expect(entregaResposta.status).to.equal(caso.entregaStatusEsperado);
            expect(entregaResposta.body.alunoId).to.equal(alunoId);
            expect(entregaResposta.body.disciplinaId).to.equal(caso.disciplinaId);
            expect(entregaResposta.body.titulo).to.equal(caso.titulo);
            expect(entregaResposta.body.descricao).to.equal(caso.descricao);
            expect(entregaResposta.body.status).to.equal('entregue');
        });
    });
}
