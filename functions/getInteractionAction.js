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
	'SELECT_MENU': 'selectMenu',
	'TEXT_INPUT': 'textInput',
};

/**
 * Возвращает название функции для обработки данной Interaction
 *
 * @param  {Interaction} int Interaction
 * @return {String}
 */
module.exports = int => {

	if(int.type == 'APPLICATION_COMMAND'){

		if(int.targetId === undefined){
			return 'slash';
		}else{
			return targetType[int.targetType];
		}

	}else if(int.type == 'MESSAGE_COMPONENT'){
		return componentType[int.componentType];
	}else{
		return type[int.type];
	}

};
