using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class HandleScript : MonoBehaviour
{
    public void RotateHandle(int direction) {
        // GetComponent<MeshRenderer>().material.color = Color.red;
        transform.Rotate(0, 0, -direction * 10);
        // transform.rotation = Quaternion.Euler(0, 0, direction * 10);
        // transform.position = new Vector3(x, 0, 0);

    }
}
