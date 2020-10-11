module.exports = async function(context) {
	let me = context;
	return {
		'def_fuera': {
			x_icons:'desktop_new',
			func: async function(node) {
				let resp = me.reply_template({ otro:'Pepino' });
				console.log('text:' + this.x_text + ' node dice Hola! from remote commands',this);
				return resp;
			}
		}
	}
};