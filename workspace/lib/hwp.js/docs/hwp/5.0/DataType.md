# 자료형 설명
앞으로 계속되는 설명에서 한글의 문서 파일에 저장되는 정보는 아래 표에 설명하는 자료형을 이용해 표현한다.
자료형에서 한 바이트는 8 비트로 표현되며, 두 바이트 이상의 길이를 가지는 자료형은 최하위 바이트가 가장 먼저 저장되고, 최상위 바이트가 가장 나중에 저장되는 리틀 엔디언(Little-endian) 형태이다.
파일에 저장되는 자료가 배열(array)일 때는 `자료형 array[개수]`와 같이 표현한다. 예를 들어 10개의 원소를 갖는 word 배열이면 `word array[10]`과 같이 표현한다.

| 자료형          | 길이 | 부호 | 설명 |
| ------------- |:---:|:---:| --- |
| BYTE          | 1   |     | 부호 없는 한 바이트(0～255) |
| WORD          | 2   |     | 16비트 컴파일러에서 `unsigned int`에 해당 |
| DWORD         | 4   |     | 16비트 컴파일러에서 `unsigned long`에 해당 |
| WCHAR         | 2   |     | 한글의 기본 코드로 유니코드 기반 문자 |
| HWPUNIT       | 4   |     | 1/7200인치로 표현된 한글 내부 단위 |
| SHWPUNIT      | 4   | √   | 1/7200인치로 표현된 한글 내부 단위 |
| UINT8         | 1   |     | `unsigned __int8` 에 해당 |
| UINT16        | 2   |     | `unsigned __int16` 에 해당 |
| UINT32(=UINT) | 4   |     | `unsigned __int32` 에 해당 |
| INT8          | 1   | √   | `signed __int8` 에 해당 |
| INT16         | 2   | √   | `signed __int16` 에 해당 |
| INT32         | 4   | √   | `signed __int32` 에 해당 |
| HWPUNIT16     | 2   | √   | INT16 과 같다. |
| COLORREF      | 4   |     | RGB값(0x00bbggrr)을 십진수로 표시 (rr : red 1 byte, gg : green 1 byte, bb : blue 1 byte) |
| BYTE stream   |     |     | 일련의 BYTE로 구성됨. 본문 내에서 다른 구조를 참조할 경우에 사용됨 |

WCHAR는 한글의 내부 코드로 표현된 문자 한 글자를 표현하는 자료형이다. 한글의 내부 코드는 한글, 영문, 한자를 비롯해 모든 문자가 2 바이트의 일정한 길이를 가진다.
HWPUNIT과 SHWPUNIT는 문자의 크기, 그림의 크기, 용지 여백 등, 문서를 구성하는 요소들의 크기를 표현하기 위한 자료형이다. 문서 출력 장치의 해상도는 가변적이기 때문에, 크기 정보를 점(도트)의 수로 표현할 수는 없다. 따라서 일정한 단위를 기준으로 해야 하는데, 한글에서는 1/7200인치를 기본 단위로 사용한다. 예를 들어 [가로 2 인치 x 세로 1 인치]짜리 그림의 크기를 HWPUNIT 형으로 표현하면 각각 14400 x 7200이 된다.