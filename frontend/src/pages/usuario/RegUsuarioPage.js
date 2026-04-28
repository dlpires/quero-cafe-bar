import './RegUsuarioPage.css'
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';

const pageName = 'Cadastrar Usuário';

class RegUsuarioPage extends HTMLElement {
  connectedCallback() {
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content class="ion-padding">
        <form id="form-usuario">
          <ion-list>
            <ion-item>
              <ion-input type="text" name="nome" label="Nome Completo" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-input type="text" name="usuario" label="Usuário" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-input type="password" name="senha" label="Senha" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-select name="perfil" label="Perfil" label-placement="floating" value="1">
                <ion-select-option value="0">Administrador</ion-select-option>
                <ion-select-option value="1">Atendente</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <div class="ion-padding">
            <ion-button expand="block" type="submit" class="ion-margin-top">
              <ion-icon name="checkmark-circle" slot="start" style="margin-right: 8px;"></ion-icon>
              Salvar Usuário
            </ion-button>
            <ion-button expand="block" color="danger" id="btn-cancelar">
              <ion-icon name="close-circle" slot="start" style="margin-right: 8px;"></ion-icon>
              Cancelar
            </ion-button>
          </div>
        </form>
      </ion-content>
    `;

    this.querySelector('#form-usuario').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#btn-cancelar').addEventListener('click', () => this.navigateBack());
  }

  async handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const usuarioData = {
      nome: formData.get('nome'),
      usuario: formData.get('usuario'),
      senha: formData.get('senha'),
      perfil: parseInt(formData.get('perfil'))
    };

    try {
      await api.addUsuario(usuarioData);
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao cadastrar usuario:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível cadastrar o usuário. Tente novamente mais tarde.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  navigateBack() {
    const router = document.querySelector('ion-router');
    router.push('/usuarios', 'root');
  }
}

customElements.define('reg-usuario-page', RegUsuarioPage);
