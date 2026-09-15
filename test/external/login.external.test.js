import { expect } from 'chai';
import { api } from '../helpers/api.js';
import loginCases from '../fixtures/login.json' with { type: 'json' };

describe('Login External', () => {
    for (const caso of loginCases) {
        it(`deve realizar login com credenciais válidas`, async () => {
            const email = caso.emailEnv ? process.env[caso.emailEnv] : caso.email;
            const senha = caso.senhaEnv ? process.env[caso.senhaEnv] : caso.senha;

            const loginResposta = await api()
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send({ email, senha });

            expect(loginResposta.status).to.equal(caso.statusCodeEsperado);

            if (caso.emailRespostaEnv) {
                expect(loginResposta.body.usuario.email)
                    .to.equal(process.env[caso.emailRespostaEnv]);
            }

            if (caso.erroEsperado) {
                expect(loginResposta.body.error).to.equal(caso.erroEsperado);
            }
        });
    }
});