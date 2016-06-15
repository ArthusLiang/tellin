Title: Ash
SortIndex: 1
IndexPage: true
---

# function

### play

Create an instance of Ash.s and start the animation automatically.

| parameter       | optional      | description                                       |
| ----------------|:-------------:| --------------------------------------------------|
| scripts         | No            | An array to ojbect to descript the animation      |
| renderGap       | Yes           | How many frame for each rendering                 |
| endFunc         | Yes           | Callback function when the animation ends         |
| stopFunc        | Yes           | Callback function when the animation is stopped   |

return an instance of Ash.s

### stop

| parameter       | optional      | description                                       |
| ----------------|:-------------:| --------------------------------------------------|
| script         | Yes            | An instance of Ash.S                              |

# property

| name            | type          | description                                       |
| ----------------|:-------------:| --------------------------------------------------|
| Browser         | Object        | Offer some browser across support                 |
| Core            | Object        | Offer some bascial function                       |
| S               | Object        | The class to create animation instance            |
| Tween           | Object        | An public object to manager the easing formula    |