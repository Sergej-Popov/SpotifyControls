export interface Track {
	artist: string,
	title: string,
	art: string,
	progress: number,
	elapsed: string,
	length: string,
	volume: number,
	shuffle_on: boolean,
	repeat_on: boolean,
	mute_on: boolean,
	is_paused: boolean,
	is_saved: boolean
}
