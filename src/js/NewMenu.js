import CMenu from './circularmenu.js'
export {cmenu}
    
    var ele = document.querySelector('#circle-menu1');

    var cmenu = CMenu(ele)
            .config({
                        totalAngle: 360,//deg,
                        spaceDeg: 1,//deg
                        background: "#32323285",
                        backgroundHover: "#123321",
                        percent: 0.32,//%
                        diameter: 150,//px
                        position: 'top',
                        horizontal: true,
                        //start: -45,//deg
                        animation: "into",
                        menus: [
                            {
                                title: 'menu1',
                                icon: 'fa fa-circle',
                                href: {
                                    url: "http://github.com",
                                    blank: false
                                },
                                click: function (e, data) {
                                    console.log(123);
                                },
                            },
                            {
                                disabled: true,
                                title: '菜单2',
                                icon: 'my-icon icon1',
                                href: '#2'
                            },
                            {
                                title: 'menu3',
                                disabled: function(){
                                    return true;
                                },
                                icon: '',
                                href: '#3'
                            },
                            {
                                title: '菜单4',
                                icon: 'my-icon icon2',
                                href: '#4',
                            }, {
                                title: 'Circle',
                                icon: '',
                                href: '#5',
                                menus: [
                                    {
                                        title: 'menu1-1',
                                        icon: 'fa fa-circle'
                                    },
                                    {
                                        title: 'menu1-2',
                                        icon: 'fa fa-cc-visa'
                                    }
                                ]
                            },
                            {
                                title: 'Rectangle',
                                icon: '',
                                href: '#6',
                                menus: [
                                    {
                                        title: 'menu6-1',
                                        icon: 'fa fa-circle'
                                    }
                                ]
                            },
                            {
                                title: 'menu7',
                                icon: 'my-icon icon3',
                                href: '#7'
                            },
                            {
                                title: 'Assembly',
                                icon: '',
                                href: '#8'
                            }
                        ]
                    });

    document.getElementById('flow-canvas').addEventListener('contextmenu', (e) => {
            ev.preventDefault()
            cmenu.show([e.clientX, e.clientY])
        })        

 