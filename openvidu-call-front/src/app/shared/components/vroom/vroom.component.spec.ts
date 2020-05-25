import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualRoomComponent } from './vroom.component';
import { UtilsService } from '../../services/utils/utils.service';
import { UtilsServiceMock } from '../../services/utils/utils.service.mock';
import { UserModel } from '../../models/user-model';

describe('VirtualRoomComponent', () => {
	let component: VirtualRoomComponent;
	let fixture: ComponentFixture<VirtualRoomComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VirtualRoomComponent],
			providers: [{ provide: RemoteUsersService, useClass: RemoteUsersServiceMock }]
		}).compileComponents();
		fixture = TestBed.createComponent(VirtualRoomComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
