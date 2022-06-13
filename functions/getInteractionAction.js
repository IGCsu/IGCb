const type = {
	'APPLICATION_COMMAND_AUTOCOMPLETE': 'autocomplete',
	'MODAL_SUBMIT': 'modal',
};

const targetType = {
	'USER': 'contextUser',
	'MESSAGE': 'contextMesage'
};

const componentType = {
	'BUTTON': 'button',
	'SELECT_MENU': 'selectMenu'
};

/**
 * Возвращает название функции для обработки данной интерации
 *
 * @param {AutocompleteInteraction|ModalSubmitInteraction|UserContextMenuInteraction|MessageContextMenuInteraction|ButtonInteraction|SelectMenuInteraction} int Объект интерации
 * @return {String} Название входной функции
 */
global.getInteractionAction = (int) => {

	if(int.type === 'APPLICATION_COMMAND'){

		if(int.targetId === undefined){
			return 'slash';
		}else{
			return targetType[int.targetType];
		}

	}else if(int.type === 'MESSAGE_COMPONENT'){

		return componentType[int.componentType];

	}else{

		return type[int.type];

	}

}
