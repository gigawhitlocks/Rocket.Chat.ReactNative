import React from 'react';
import PropTypes from 'prop-types';
import { View, Platform, SectionList, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { connect } from 'react-redux';

import styles from './styles';
import Avatar from '../../containers/Avatar';
import Touch from '../../utils/touch';

@connect(state => ({
	baseUrl: state.settings.Site_Url || state.server ? state.server.server : ''
}))
export default class extends React.PureComponent {
	static propTypes = {
		baseUrl: PropTypes.string,
		navigation: PropTypes.object
	}

	static navigationOptions = () => ({
		title: 'Actions',
		headerRight: (
			<Touch
				style={styles.headerButton}
				// onPress={() => this.props.navigation.navigate('RoomActions')}
				accessibilityLabel='Star room'
				accessibilityTraits='button'
			>
				<Icon
					name={Platform.OS === 'ios' ? 'ios-star' : 'md-star'}
					// name={Platform.OS === 'ios' ? 'ios-star-outline' : 'md-star-outline'}
					color='#292E35'
					size={24}
					backgroundColor='transparent'
				/>
			</Touch>
		)
	});

	constructor(props) {
		super(props);
		this.room = props.navigation.state.params.room;
		const sections = [{
			data: [{ icon: 'ios-star', name: 'USER' }],
			renderItem: this.renderRoomInfo
		}, {
			data: [
				{ icon: 'ios-call-outline', name: 'Voicecall' },
				{ icon: 'ios-videocam-outline', name: 'Video call' }
			],
			renderItem: this.renderItem
		}, {
			data: [
				{ icon: 'ios-attach', name: 'Files' },
				{ icon: 'ios-at-outline', name: 'Mentions' },
				{ icon: 'ios-star-outline', name: 'Starred' },
				{ icon: 'ios-search', name: 'Search' },
				{ icon: 'ios-share-outline', name: 'Share' },
				{ icon: 'ios-pin', name: 'Pinned' },
				{ icon: 'ios-code', name: 'Snippets' },
				{ icon: 'ios-notifications-outline', name: 'Notifications preferences' }
			],
			renderItem: this.renderItem
		}];
		if (this.room.t === 'd') {
			sections.push({
				data: [
					{ icon: 'ios-volume-off', name: 'Mute user' },
					{ icon: 'block', name: 'Block user', type: 'danger' }
				],
				renderItem: this.renderItem
			});
		} else {
			sections[2].data.unshift({ icon: 'ios-people', name: 'Members', description: '42 members' });
			sections.push({
				data: [
					{ icon: 'ios-volume-off', name: 'Mute channel' },
					{ icon: 'block', name: 'Leave channel', type: 'danger' }
				],
				renderItem: this.renderItem
			});
		}
		this.state = { sections };
	}

	renderRoomInfo = ({ item }) => this.renderTouchableItem([
		<Avatar
			key='avatar'
			text={this.room.name}
			size={50}
			style={StyleSheet.flatten(styles.avatar)}
			baseUrl={this.props.baseUrl}
			type={this.room.t}
		/>,
		<View key='name' style={styles.roomTitleContainer}>
			<Text style={styles.roomTitle}>{this.room.fname}</Text>
			<Text style={styles.roomDescription}>@{this.room.name}</Text>
		</View>,
		<Icon key='icon' name='ios-arrow-forward' size={20} style={styles.sectionItemIcon} color='#cbced1' />
	], item)

	renderTouchableItem = (subview, item) => (
		<Touch
			onPress={() => {}}
			underlayColor='#FFFFFF'
			activeOpacity={0.5}
			accessibilityLabel={item.name}
			accessibilityTraits='button'
		>
			<View style={styles.sectionItem}>
				{subview}
			</View>
		</Touch>
	)

	renderItem = ({ item }) => {
		if (item.type === 'danger') {
			const subview = [
				<MaterialIcon key='icon' name={item.icon} size={20} style={[styles.sectionItemIcon, styles.textColorDanger]} />,
				<Text key='name' style={[styles.sectionItemName, styles.textColorDanger]}>{ item.name }</Text>
			];
			return this.renderTouchableItem(subview, item);
		}
		const subview = [
			<Icon key='left-icon' name={item.icon} size={24} style={styles.sectionItemIcon} />,
			<Text key='name' style={styles.sectionItemName}>{ item.name }</Text>,
			item.description && <Text key='description' style={styles.sectionItemDescription}>{ item.description }</Text>,
			<Icon key='right-icon' name='ios-arrow-forward' size={20} style={styles.sectionItemIcon} color='#cbced1' />
		];
		return this.renderTouchableItem(subview, item);
	}

	renderSectionSeparator = (data) => {
		if (!data.trailingItem) {
			if (!data.trailingSection) {
				return <View style={styles.sectionSeparatorBorder} />;
			}
			return null;
		}
		return (
			<View style={[styles.sectionSeparator, data.leadingSection && styles.sectionSeparatorBorder]} />
		);
	}

	render() {
		return (
			<SectionList
				style={styles.container}
				stickySectionHeadersEnabled={false}
				sections={this.state.sections}
				SectionSeparatorComponent={this.renderSectionSeparator}
				keyExtractor={(item, index) => index}
			/>
		);
	}
}
