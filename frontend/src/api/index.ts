import { IAuthApi } from './authApi';
import { IClientApi } from './clientApi';
import { IPlanApi } from './planApi';
import { IMembershipApi } from './membershipApi';
import { IUserApi } from './userApi';

import { MockAuthApi } from './mock/mockAuthApi';
import { MockClientApi } from './mock/mockClientApi';
import { MockPlanApi } from './mock/mockPlanApi';
import { MockMembershipApi } from './mock/mockMembershipApi';
import { MockUserApi } from './mock/mockUserApi';

import { RealAuthApi } from './real/realAuthApi';
import { RealClientApi } from './real/realClientApi';
import { RealPlanApi } from './real/realPlanApi';
import { RealMembershipApi } from './real/realMembershipApi';
import { RealUserApi } from './real/realUserApi';

// Determine implementation choice strictly at composition root
const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.VITE_USE_MOCK_API === true;

export const authService: IAuthApi = useMockApi ? new MockAuthApi() : new RealAuthApi();
export const clientService: IClientApi = useMockApi ? new MockClientApi() : new RealClientApi();
export const planService: IPlanApi = useMockApi ? new MockPlanApi() : new RealPlanApi();
export const membershipService: IMembershipApi = useMockApi ? new MockMembershipApi() : new RealMembershipApi();
export const userService: IUserApi = useMockApi ? new MockUserApi() : new RealUserApi();

export { resetMockStore } from './mock/mockStore';
