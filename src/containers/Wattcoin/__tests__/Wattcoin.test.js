import React from 'react';
import { Provider } from 'react-redux';
import WattcoinContainer, { Wattcoin } from '../Wattcoin';
import { CoinButton, Loader, RecentTransactions } from '../../../components';
import { mountWithIntl, shallowWithIntl } from '../../../services/intlTestHelper';
import configureMockStore from 'redux-mock-store';

import * as usersActions from '../../../action_performers/users';
import * as notificationActions from '../../../action_performers/notifications';
import * as txActions from '../../../action_performers/transactions';
import * as appActions from '../../../action_performers/app';

const context = {
    intl: {
        formatMessage: jest.fn()
    },
    router: {
        history: { push: jest.fn() }
    }
};

const mockStore = configureMockStore();
const store = mockStore({
    Users: {
        profile: {
            data: {
                user: {
                    id: 1
                }
            }
        }
    },
    Transactions: {
        recentTransactions: {
            data: {
                currentBalance: {
                    date: 1523707200,
                    balance: 40.4
                },
                transactions: [
                    {
                        id: 1,
                        date: 1523707200,
                        name: 'Bought 23 kWh Alice',
                        amount: 0.81
                    },
                    {
                        id: 2,
                        date: 1523707200,
                        name: 'Monthly invoice',
                        amount: 0.81
                    },
                    {
                        id: 3,
                        date: 1523707200,
                        name: 'Bought 23 kWh from Peter',
                        amount: 0.81
                    }
                ]
            },
            loading: false,
            error: null
        }
    }
});

const props = {
    recentTransactions: {
        currentBalance: {
            date: 1523707200,
            balance: 40.4
        },
        transactions: [
            {
                id: 1,
                date: 1523707200,
                name: 'Bought 23 kWh Alice',
                amount: 0.81
            },
            {
                id: 2,
                date: 1523707200,
                name: 'Monthly invoice',
                amount: 0.81
            },
            {
                id: 3,
                date: 1523707200,
                name: 'Bought 23 kWh from Peter',
                amount: 0.81
            }
        ]
    },
    user: { id: 'testId' },
    loading: false,
    error: null
};

function renderContainer() {
    return mountWithIntl(
        <Provider store={store}>
            <WattcoinContainer context={context} />
        </Provider>
    );
}

function renderComponent() {
    return shallowWithIntl(<Wattcoin {...props} context={context} />);
}

describe('<Wattcoin /> Component', () => {
    beforeEach(() => {
        context.router.history.push = jest.fn();
        context.intl.formatMessage = jest.fn();
        usersActions.performGetUserData = jest.fn();
        txActions.performGetRecentTransactions = jest.fn();
        notificationActions.performPushNotification = jest.fn();
        appActions.performSetupBreadcrumbs = jest.fn();
    });

    it(`should contains following controls:
        - 2 <CoinButton /> components;
        - 1 <RecentTransactions /> component;
        - 1 <Loader /> component;
        - 3 <section> and one with class "overview-page";
        - 1 <h1> element;`, () => {
        const component = renderContainer();

        expect(component.find('section.wattcoin-page')).toHaveLength(1);
        expect(component.find('section')).toHaveLength(3);
        expect(component.find(CoinButton)).toHaveLength(2);
        expect(component.find(Loader)).toHaveLength(1);
        expect(component.find(RecentTransactions)).toHaveLength(1);
    });

    it('should call prepare common function', () => {
        const component = renderContainer();
        const table = component.find(RecentTransactions).at(0);
        const tableProps = table.props();
        delete tableProps.onButtonClick;
        expect(tableProps).toEqual({
            pagination: true,
            currentBalance: {
                date: 1523707200,
                balance: 40.4
            },
            labels: {
                header: 'Wattcoin',
                recentTransactionsMonthlyBalance: 'Monthly Balance',
                recentTransactionsHeaderAmount: 'Amount',
                recentTransactionsHeaderDate: 'Date',
                recentTransactionsHeaderTransaction: 'Transaction',
                recentTransactionsMore: 'More',
                recentTransactionsTitle: 'Most Recent Transactions',
                sellCoinsButton: 'Sell Coins',
                buyCoinsButton: 'Buy Coins'
            },
            transactions: [
                { amount: 0.81, date: 1523707200, id: 1, name: 'Bought 23 kWh Alice' },
                { amount: 0.81, date: 1523707200, id: 2, name: 'Monthly invoice' },
                { amount: 0.81, date: 1523707200, id: 3, name: 'Bought 23 kWh from Peter' }
            ]
        });

        const buy = component.find(CoinButton).at(0);
        const sell = component.find(CoinButton).at(1);

        const buyProps = buy.props();
        const sellProps = sell.props();

        expect(buyProps).toEqual({
            disabled: false,
            label: 'Buy Coins',
            price: 2.5
        });
        expect(sellProps).toEqual({
            disabled: false,
            label: 'Sell Coins',
            price: 2.4
        });
    });

    it('should returns correct props map', () => {
        const stateDummy = {
            Transactions: {
                recentTransactions: {
                    data: 'tx_data',
                    error: null,
                    loading: false
                }
            },
            Users: {
                profile: {
                    data: { user: 'user_data' },
                    error: 'test_error',
                    loading: 'test_loading'
                }
            }
        };
        const props = Wattcoin.mapStateToProps(stateDummy);
        expect(props).toEqual({
            recentTransactions: 'tx_data',
            user: 'user_data',
            error: 'test_error',
            loading: 'test_loading'
        });
    });

    it('should perform related actions on did mount step', () => {
        renderContainer();

        expect(appActions.performSetupBreadcrumbs.mock.calls.length).toEqual(1);
        const [[bArg1]] = appActions.performSetupBreadcrumbs.mock.calls;
        expect(bArg1).toEqual([
            {
                icon: 'faChartBar',
                id: 'trading',
                label: 'Trading',
                path: '/trading'
            },
            {
                id: 'wattcoin',
                label: 'Wattcoin',
                path: '/trading/wattcoin'
            }
        ]);

        expect(usersActions.performGetUserData.mock.calls.length).toEqual(1);

        const component = renderComponent();
        expect(usersActions.performGetUserData.mock.calls.length).toEqual(2);
        expect(txActions.performGetRecentTransactions.mock.calls.length).toEqual(0);

        component.setProps({ user: { id: 10 } });
        expect(txActions.performGetRecentTransactions.mock.calls.length).toEqual(1);
        const [[userId]] = txActions.performGetRecentTransactions.mock.calls;
        expect(userId).toEqual(10);

        component.setProps({ error: { message: 'Error Message' } });
        expect(notificationActions.performPushNotification.mock.calls.length).toEqual(1);
        const [[error]] = notificationActions.performPushNotification.mock.calls;
        expect(error).toEqual({ message: 'Error Message', type: 'error' });
    });
});