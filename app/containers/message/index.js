import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableHighlight, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { emojify } from 'react-emojione';

import { actionsShow, errorActionsShow, toggleReactionPicker } from '../../actions/messages';
import Image from './Image';
import User from './User';
import Avatar from '../Avatar';
import Audio from './Audio';
import Video from './Video';
import Markdown from './Markdown';
import Url from './Url';
import Reply from './Reply';
import CustomEmoji from '../CustomEmoji';
import messageStatus from '../../constants/messagesStatus';
import styles from './styles';

const avatar = { marginRight: 10 };
const flex = { flexDirection: 'row', flex: 1 };

@connect(state => ({
	message: state.messages.message,
	editing: state.messages.editing,
	customEmojis: state.customEmojis
}), dispatch => ({
	actionsShow: actionMessage => dispatch(actionsShow(actionMessage)),
	errorActionsShow: actionMessage => dispatch(errorActionsShow(actionMessage)),
	toggleReactionPicker: message => dispatch(toggleReactionPicker(message))
}))
export default class Message extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		baseUrl: PropTypes.string.isRequired,
		Message_TimeFormat: PropTypes.string.isRequired,
		message: PropTypes.object.isRequired,
		user: PropTypes.object.isRequired,
		editing: PropTypes.bool,
		actionsShow: PropTypes.func,
		errorActionsShow: PropTypes.func,
		animate: PropTypes.bool,
		customEmojis: PropTypes.object
	}

	componentWillMount() {
		this._visibility = new Animated.Value(this.props.animate ? 0 : 1);
	}
	componentDidMount() {
		if (this.props.animate) {
			Animated.timing(this._visibility, {
				toValue: 1,
				duration: 300
			}).start();
		}
	}
	componentWillReceiveProps() {
		this.extraStyle = this.extraStyle || {};
		if (this.props.item.status === messageStatus.TEMP || this.props.item.status === messageStatus.ERROR) {
			this.extraStyle.opacity = 0.3;
		}
	}

	shouldComponentUpdate(nextProps) {
		return this.props.item._updatedAt.toGMTString() !== nextProps.item._updatedAt.toGMTString() || this.props.item.status !== nextProps.item.status;
	}

	onLongPress() {
		const { item } = this.props;
		this.props.actionsShow(JSON.parse(JSON.stringify(item)));
	}

	onErrorPress() {
		const { item } = this.props;
		this.props.errorActionsShow(JSON.parse(JSON.stringify(item)));
	}

	onReactionPress(emoji) {
		console.warn(JSON.parse(JSON.stringify(this.props.item)))
	}

	getInfoMessage() {
		let message = '';
		const messageType = this.props.item.t;

		if (messageType === 'rm') {
			message = 'Message removed';
		} else if (messageType === 'uj') {
			message = 'Has joined the channel.';
		} else if (messageType === 'r') {
			message = `Room name changed to: ${ this.props.item.msg } by ${ this.props.item.u.username }`;
		} else if (messageType === 'message_pinned') {
			message = 'Message pinned';
		} else if (messageType === 'ul') {
			message = 'Has left the channel.';
		} else if (messageType === 'ru') {
			message = `User ${ this.props.item.msg } removed by ${ this.props.item.u.username }`;
		} else if (messageType === 'au') {
			message = `User ${ this.props.item.msg } added by ${ this.props.item.u.username }`;
		} else if (messageType === 'user-muted') {
			message = `User ${ this.props.item.msg } muted by ${ this.props.item.u.username }`;
		} else if (messageType === 'user-unmuted') {
			message = `User ${ this.props.item.msg } unmuted by ${ this.props.item.u.username }`;
		}

		return message;
	}

	isInfoMessage() {
		return ['r', 'au', 'ru', 'ul', 'uj', 'rm', 'user-muted', 'user-unmuted', 'message_pinned'].includes(this.props.item.t);
	}


	isDeleted() {
		return this.props.item.t === 'rm';
	}

	hasError() {
		return this.props.item.status === messageStatus.ERROR;
	}

	attachments() {
		if (this.props.item.attachments.length === 0) {
			return null;
		}

		const file = this.props.item.attachments[0];
		const { baseUrl, user } = this.props;
		if (file.image_type) {
			return <Image file={file} baseUrl={baseUrl} user={user} />;
		} else if (file.audio_type) {
			return <Audio file={file} baseUrl={baseUrl} user={user} />;
		} else if (file.video_type) {
			return <Video file={file} baseUrl={baseUrl} user={user} />;
		}

		return <Reply attachment={file} timeFormat={this.props.Message_TimeFormat} />;
	}

	renderMessageContent() {
		if (this.isInfoMessage()) {
			return <Text style={styles.textInfo}>{this.getInfoMessage()}</Text>;
		}
		const { item, customEmojis, baseUrl } = this.props;
		return <Markdown msg={item.msg} customEmojis={customEmojis} baseUrl={baseUrl} />;
	}

	renderUrl() {
		if (this.props.item.urls.length === 0) {
			return null;
		}

		return this.props.item.urls.map(url => (
			<Url url={url} key={url._id} />
		));
	}

	renderError = () => {
		if (!this.hasError()) {
			return null;
		}
		return (
			<TouchableOpacity onPress={() => this.onErrorPress()}>
				<Icon name='error-outline' color='red' size={20} style={{ padding: 10, paddingRight: 12, paddingLeft: 0 }} />
			</TouchableOpacity>
		);
	}

	renderReactionEmoji(content) {
		const parsedContent = content.replace(/^:|:$/g, '');
		const emojiExtension = this.props.customEmojis[parsedContent];
		if (emojiExtension) {
			const emoji = { extension: emojiExtension, content: parsedContent };
			const style = StyleSheet.flatten(styles.reactionCustomEmoji);
			return <CustomEmoji key={content} style={style} emoji={emoji} />;
		}
		return <Text style={styles.reactionEmoji}>{ emojify(`${ content }`, { output: 'unicode' }) }</Text>;
	}

	renderReaction(reaction) {
		return (
			<TouchableOpacity
				onPress={() => this.onReactionPress(reaction.emoji)}
				key={reaction.emoji}
			>
				<View style={styles.reactionContainer}>
					{ this.renderReactionEmoji(reaction.emoji) }
					<Text style={styles.reactionCount}>{ reaction.usernames.length }</Text>
				</View>
			</TouchableOpacity>
		);
	}

	renderReactions() {
		if (this.props.item.reactions.length === 0) {
			return null;
		}
		return (
			<View style={styles.reactionsContainer}>
				{this.props.item.reactions.map(reaction => this.renderReaction(reaction))}
				<TouchableOpacity
					onPress={() => this.props.toggleReactionPicker()}
					key='add-reaction'
					style={styles.reactionContainer}
				>
					<Icon name='insert-emoticon' size={15} />
				</TouchableOpacity>
			</View>
		);
	}

	render() {
		const {
			item, message, editing, baseUrl
		} = this.props;

		const marginLeft = this._visibility.interpolate({
			inputRange: [0, 1],
			outputRange: [-30, 0]
		});
		const opacity = this._visibility.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1]
		});
		const username = item.alias || item.u.username;
		const isEditing = message._id === item._id && editing;

		const accessibilityLabel = `Message from ${ item.alias || item.u.username } at ${ moment(item.ts).format(this.props.Message_TimeFormat) }, ${ this.props.item.msg }`;

		return (
			<TouchableHighlight
				onLongPress={() => this.onLongPress()}
				disabled={this.isDeleted() || this.hasError()}
				underlayColor='#FFFFFF'
				activeOpacity={0.3}
				style={[styles.message, isEditing ? styles.editing : null]}
				accessibilityLabel={accessibilityLabel}
			>
				<Animated.View style={[flex, { opacity, marginLeft }]}>
					{this.renderError()}
					<View style={[this.extraStyle, flex]}>
						<Avatar
							style={avatar}
							text={item.avatar ? '' : username}
							size={40}
							baseUrl={baseUrl}
							avatar={item.avatar}
						/>
						<View style={[styles.content]}>
							<User
								onPress={this._onPress}
								item={item}
								Message_TimeFormat={this.props.Message_TimeFormat}
								baseUrl={baseUrl}
							/>
							{this.renderMessageContent()}
							{this.attachments()}
							{this.renderUrl()}
							{this.renderReactions()}
						</View>
					</View>
				</Animated.View>
			</TouchableHighlight>
		);
	}
}
