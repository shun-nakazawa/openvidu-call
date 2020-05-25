import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { UserModel } from '../../models/user-model';

@Component({
	selector: 'vroom-component',
	styleUrls: ['./vroom.component.css'],
	templateUrl: './vroom.component.html'
})
export class VirtualRoomComponent implements OnInit {
	@ViewChild('vroom') vroom: ElementRef;

	_localUsers: UserModel[] = [];

	_remoteUsers: UserModel[] = [];

	@Output() locationChanged = new EventEmitter<any>();

	@Input()
	set localUsers(users: UserModel[]) {
		this._localUsers = users;
	}

	@Input()
	set remoteUsers(users: UserModel[]) {
		this._remoteUsers = users;
	}

	constructor() {}

	ngOnInit() {
	}

	mousedown(event) {
		const rect = event.currentTarget.getBoundingClientRect();
		this.locationChanged.emit({
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		});
	}
}
